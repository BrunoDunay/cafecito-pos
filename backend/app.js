import express from 'express';
import cors from 'cors';
import path from 'path';

import routes from './src/routes/index.js';
import logger from './src/middlewares/logger.js';
import errorHandler from './src/middlewares/error.handler.js';
import securityHeaders from './src/middlewares/security.headers.js';

// La app se arma aquí y server.js solo la conecta a la BD y la levanta.
// Así las pruebas pueden usarla con supertest sin abrir un puerto.
const app = express();

app.disable('x-powered-by');
app.use(securityHeaders);

app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Middlewares
app.use(
  cors({
    origin: process.env.FRONT_APP_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);

app.use(express.json());
app.use(logger);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'Backend Cafecito POS funcionando' });
});

// Rutas API
app.use('/api', routes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
  });
});

// Error handler
app.use(errorHandler);

export default app;
