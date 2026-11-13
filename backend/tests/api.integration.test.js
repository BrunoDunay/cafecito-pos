// Pruebas de integración: la API completa (rutas, middlewares, controladores y modelos)
// contra una MongoDB en memoria. No toca la base de datos real.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

process.env.JWT_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

let mongo, app, User, Product, Category, Sale;

const ADMIN = { name: 'Admin', email: 'admin@cafecito.test', password: 'admin123', role: 'admin' };
const SELLER = { name: 'Vendedor', email: 'seller@cafecito.test', password: 'seller123', role: 'seller' };

const login = async ({ email, password }) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token;
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = (await import('../app.js')).default;
  User = (await import('../src/models/User.js')).default;
  Product = (await import('../src/models/Product.js')).default;
  Category = (await import('../src/models/Category.js')).default;
  Sale = (await import('../src/models/Sale.js')).default;
}, 120000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});

let adminToken, sellerToken, cafe, pan;

beforeEach(async () => {
  await mongoose.connection.db.dropDatabase();
  for (const u of [ADMIN, SELLER]) {
    await User.create({ ...u, password: await bcrypt.hash(u.password, 10) });
  }
  const bebidas = await Category.create({ name: 'Bebidas' });
  cafe = await Product.create({ name: 'Café americano', price: 35, stock: 5, category: bebidas._id });
  pan = await Product.create({ name: 'Pan dulce', price: 20, stock: 1, category: bebidas._id });
  adminToken = await login(ADMIN);
  sellerToken = await login(SELLER);
});

describe('Autenticación', () => {
  it('inicia sesión con credenciales correctas y no regresa la contraseña', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: ADMIN.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('rechaza una contraseña incorrecta con el mismo mensaje que un correo inexistente', async () => {
    const wrong = await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: 'otra' });
    const missing = await request(app).post('/api/auth/login').send({ email: 'nadie@x.test', password: 'otra' });
    expect(wrong.status).toBe(401);
    expect(missing.status).toBe(401);
    expect(wrong.body.message).toBe(missing.body.message);
  });

  it('rechaza operadores de Mongo en el login (inyección NoSQL)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $ne: null }, password: { $ne: null } });
    expect(res.status).toBe(400);
    expect(res.body.token).toBeUndefined();
  });

  it('no escribe la contraseña de un login fallido en el log de errores', async () => {
    const logFile = path.join(process.cwd(), 'logs', 'error.log');
    const before = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').length : 0;
    await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: 'contraseña-secreta-123' });
    const added = fs.readFileSync(logFile, 'utf8').slice(before);
    expect(added).not.toContain('contraseña-secreta-123');
    expect(added).toContain('[REDACTED]');
  });

  it('exige token en rutas protegidas y rechaza uno falso', async () => {
    expect((await request(app).get('/api/products')).status).toBe(401);
    const res = await request(app).get('/api/products').set('Authorization', 'Bearer token.falso.123');
    expect(res.status).toBe(401);
  });

  it('bloquea a un usuario desactivado aunque su token siga vigente', async () => {
    await User.updateOne({ email: SELLER.email }, { is_active: false });
    const res = await request(app).get('/api/products').set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(403);
  });
});

describe('Permisos por rol', () => {
  it('un vendedor no puede crear productos ni ver usuarios', async () => {
    const create = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Hack', price: 1, stock: 1, category: cafe.category });
    expect(create.status).toBe(403);
    const users = await request(app).get('/api/users').set('Authorization', `Bearer ${sellerToken}`);
    expect(users.status).toBe(403);
  });

  it('el admin sí puede crear productos', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Latte', price: 45, stock: 10, category: cafe.category });
    expect(res.status).toBe(201);
  });

  it('la lista de usuarios nunca incluye contraseñas', async () => {
    const res = await request(app).get('/api/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
  });
});

describe('Ventas e inventario', () => {
  const sell = (items, token = sellerToken) =>
    request(app).post('/api/sales').set('Authorization', `Bearer ${token}`).send({ items, payment_method: 'cash' });

  it('una venta descuenta el stock y calcula el total con el precio de la base de datos', async () => {
    const res = await sell([{ product_id: cafe._id, quantity: 2 }]);
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(70);
    expect((await Product.findById(cafe._id)).stock).toBe(3);
  });

  it('si un producto no alcanza, no se descuenta nada de los demás ni se crea la venta', async () => {
    const res = await sell([
      { product_id: cafe._id, quantity: 2 },
      { product_id: pan._id, quantity: 3 },
    ]);
    expect(res.status).toBe(400);
    expect((await Product.findById(cafe._id)).stock).toBe(5);
    expect(await Sale.countDocuments()).toBe(0);
  });

  it('el mismo producto repetido en dos renglones no puede rebasar el stock', async () => {
    const res = await sell([
      { product_id: cafe._id, quantity: 3 },
      { product_id: cafe._id, quantity: 3 },
    ]);
    expect(res.status).toBe(400);
    expect((await Product.findById(cafe._id)).stock).toBe(5);
  });

  it('dos ventas simultáneas del último pan: solo una pasa y el stock no queda negativo', async () => {
    const [a, b] = await Promise.all([
      sell([{ product_id: pan._id, quantity: 1 }]),
      sell([{ product_id: pan._id, quantity: 1 }]),
    ]);
    expect([a.status, b.status].sort()).toEqual([201, 400]);
    expect((await Product.findById(pan._id)).stock).toBe(0);
  });

  it('rechaza cantidades negativas, decimales o en texto', async () => {
    for (const quantity of [-1, 1.5, '2']) {
      const res = await sell([{ product_id: cafe._id, quantity }]);
      expect(res.status).toBe(400);
    }
    expect((await Product.findById(cafe._id)).stock).toBe(5);
  });

  it('el descuento nunca deja el total abajo de cero', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ items: [{ product_id: cafe._id, quantity: 1 }], payment_method: 'card', discount_amount: 9999 });
    expect(res.status).toBe(201);
    expect(res.body.total).toBe(0);
  });
});

describe('Encabezados', () => {
  it('no anuncia Express y manda encabezados básicos de seguridad', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
  });
});
