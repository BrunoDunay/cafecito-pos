import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Puerto
const PORT = process.env.PORT || 3001;

// MongoDB Atlas
mongoose.connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a MongoDB:', error.message);
  });

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend Cafecito POS funcionando ☕' });
});
