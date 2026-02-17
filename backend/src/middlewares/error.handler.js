// backend/middlewares/error.handler.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpeta de logs si no existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorLogPath = path.join(logDir, 'error.log');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let errors = null;

  // Manejo de errores de MongoDB
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación';
    errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `El ${field} ya existe en el sistema`;
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  }

  // Manejo de errores de autenticación
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Guardar error en archivo
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.user_id || 'anonymous',
    statusCode,
    message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    params: req.params
  };

  fs.appendFileSync(errorLogPath, JSON.stringify(logEntry) + '\n');

  // Log en consola
  console.error({
    time: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message,
    stack: err.stack
  });

  if (res.headersSent) {
    return next(err);
  }

  const response = { message };
  if (errors) response.errors = errors;
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;