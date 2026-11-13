// Debe ir primero: app.js lee variables de entorno (CORS) al importarse.
import 'dotenv/config';

import dbConnection from './src/config/database.js';
import setupGlobalErrorHandlers from './src/middlewares/global.error.js';
import initializeData from './src/config/initializeData.js';
import app from './app.js';


// Errores globales
setupGlobalErrorHandlers();

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
