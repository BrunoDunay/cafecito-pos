# ☕ Cafecito Feliz POS — MVP

Sistema de Punto de Venta (POS) desarrollado como parte del proyecto **Cafecito Feliz**, enfocado en la implementación de un MVP funcional siguiendo un contrato de API definido y reglas claras de negocio.

---

## ✨ Características

El sistema permite:

- 📦 Gestión de productos (CRUD)
- 👥 Registro y búsqueda de clientes
- 💰 Registro de ventas con cálculo automático de descuentos
- 📉 Control de stock
- 🔐 Autenticación y autorización por roles (Admin / Vendedor)

---

## 🧱 Arquitectura

El proyecto está dividido en:

```text
cafecito-pos/
│
├── backend/   → API REST (Node.js + Express)
└── frontend/  → Aplicación Angular (SPA)
```

- **Backend:** Node.js + Express + MongoDB
- **Frontend:** Angular 17+
- **Autenticación:** Bearer Token (JWT)

---

## 📋 Requisitos previos

- Node.js 18+
- npm 9+
- MongoDB (local o Atlas)

---

## 🔧 Puertos utilizados

| Servicio | URL |
|----------|------|
| Backend  | http://localhost:3001 |
| Frontend | http://localhost:4200 |

---

## ⚙️ Instalación

### 1️⃣ Clonar repositorio

```bash
git clone https://github.com/BrunoDunay/cafecito-pos
cd cafecito-pos
```

### 2️⃣ Backend

```bash
cd backend
npm install
npm run dev
```

El servidor iniciará en: `http://localhost:3001`

### 3️⃣ Frontend

```bash
cd frontend
npm install
ng serve -o
```

La aplicación abrirá automáticamente en: `http://localhost:4200`

---

## 🔐 Variables de entorno

El backend utiliza un archivo `.env` con las siguientes variables:

```env
PORT=3001
DB_CONNECTION_STRING=mongodb://localhost:27017/cafecito
JWT_SECRET=tu_secreto_super_seguro
JWT_REFRESH_SECRET=otro_secreto_para_refresh
FRONT_APP_URL=http://localhost:4200
```

⚠️ El archivo `.env` **no debe subirse al repositorio** (está en `.gitignore`).

---

# 🎯 Alcance del MVP

## ✅ Incluye

### 💰 Ventas

- Listado y búsqueda de productos
- Carrito en frontend
- Cálculo de subtotal y total
- Aplicación automática de descuento
- Generación de ticket
- Actualización de stock
- Incremento de `purchasesCount`

### 👥 Clientes

- Registro de cliente
- Búsqueda con paginación
- Identificación para descuento automático

### 📦 Productos

- Crear producto (Admin)
- Editar producto (Admin)
- Eliminar producto (Admin)

### 🔐 Roles

- **Admin:** gestión completa de productos
- **Vendedor:** ventas y clientes
- **Público:** solo consulta de productos

---

## 💰 Regla de descuentos

El descuento se calcula exclusivamente en el backend según el histórico de compras del cliente:

| Compras realizadas | Descuento |
|-------------------|-----------|
| 0                 | 0%        |
| 1 – 3             | 5%        |
| 4 – 7             | 10%       |
| 8+                | 15%       |

El frontend solo muestra el resultado calculado por la API.

---

# 📡 API

## Base URL

```text
/api
```

## Convenciones

- **API:** `snake_case` (ej: `product_id`, `is_active`)
- **Frontend:** `camelCase` (transformado automáticamente por interceptores)

---

## Endpoints principales

### 📦 Productos

| Método | Endpoint | Rol | Descripción |
|--------|----------|------|-------------|
| GET | `/api/products` | Público | Listar productos (con filtros) |
| GET | `/api/products/:id` | Público | Obtener producto por ID |
| POST | `/api/products` | Admin | Crear producto |
| PUT | `/api/products/:id` | Admin | Actualizar producto |
| DELETE | `/api/products/:id` | Admin | Eliminar producto |

---

### 👥 Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/customers` | Listar clientes (con búsqueda) |
| POST | `/api/customers` | Crear cliente |
| GET | `/api/customers/:id` | Obtener cliente por ID |
| DELETE | `/api/customers/:id` | Eliminar cliente (solo si no tiene ventas) |
| PATCH | `/api/customers/:id/status` | Activar/desactivar cliente |

---

### 💰 Ventas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/sales` | Registrar nueva venta |
| GET | `/api/sales` | Listar ventas (paginado) |
| GET | `/api/sales/:id` | Obtener venta por ID |

---

# ⚠️ Manejo de errores

## Códigos de estado HTTP

| Código | Descripción |
|--------|------------|
| 200 | OK |
| 201 | Creado |
| 400 | Bad Request (error de validación) |
| 401 | Unauthorized (no autenticado) |
| 403 | Forbidden (sin permisos) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Errores personalizados

| Error | Código | Uso |
|-------|--------|-----|
| `BadRequestError` | 400 | Validaciones, campos faltantes, duplicados |
| `UnauthorizedError` | 401 | Token inválido, expirado, credenciales incorrectas |
| `ForbiddenError` | 403 | Usuario sin permisos suficientes |
| `NotFoundError` | 404 | Recurso no encontrado |

---

# 🧠 Decisiones de arquitectura

- ✅ El descuento se calcula únicamente en backend (nunca confiar en el cliente)
- ✅ Una venta con stock insuficiente se rechaza completamente (transaccional)
- ✅ `purchasesCount` se incrementa solo cuando la venta es exitosa
- ✅ Autorización basada en roles mediante Bearer Token
- ✅ Transformación automática `snake_case` ↔ `camelCase` vía interceptores

---

# 🗂️ Estructura del backend

```text
backend/
│
├── src/
│   ├── routes/          → Definición de endpoints
│   ├── controllers/     → Lógica de requests/responses
│   ├── models/          → Esquemas de MongoDB
│   ├── middlewares/     → Auth, roles, error handler
│   ├── utils/           → Errores personalizados
│   ├── config/          → Conexión DB, inicialización
│   └── server.js        → Punto de entrada
│
├── logs/                → Archivos de error generados automáticamente
└── package.json
```

---

# 🗂️ Estructura del frontend

```text
frontend/
│
├── src/
│   ├── app/
│   │   ├── components/       → UI reutilizable (toast, modales)
│   │   ├── pages/            → Vistas principales
│   │   ├── core/
│   │   │   ├── services/     → Servicios HTTP
│   │   │   ├── interceptors/ → Auth, errores, snake-case
│   │   │   ├── guards/       → Protección de rutas
│   │   │   └── types/        → Interfaces TypeScript
│   │   └── app.routes.ts
│   │
│   └── styles/               → Estilos globales
│
└── angular.json
```

---

# 🚀 Estado del proyecto

✅ MVP completamente funcional según el contrato definido:

- Flujo de venta completo
- Aplicación correcta de descuentos
- Control de stock en tiempo real
- Manejo centralizado de errores
- Autenticación y roles implementados
- Toasts de notificación para el usuario
- Logs automáticos en backend
