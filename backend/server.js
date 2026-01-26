import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import dbConnection from './src/config/database.js';
import routes from './src/routes/index.js';
import logger from './src/middlewares/logger.js';
import errorHandler from './src/middlewares/error.handler.js';
import setupGlobalErrorHandlers from './src/middlewares/global.error.js';
import initializeData from './src/config/initializeData.js';
import path from 'path';


// Variables de entorno
dotenv.config();

// Errores globales
setupGlobalErrorHandlers();

const app = express();

app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Middlewares
app.use(
  cors({
    origin: process.env.FRONT_APP_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

const PORT = process.env.PORT || 3001;

// Conexión a BD + seed + server
dbConnection()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Running seed data...');
      initializeData();
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server not started due to DB error:', error.message);
  });
