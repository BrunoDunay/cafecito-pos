// Entrada para Vercel (funciones sin servidor). En local se sigue usando server.js.
// Conecta a MongoDB en la primera petición y reutiliza la conexión mientras la función siga viva.
import dbConnection from '../src/config/database.js';
import initializeData from '../src/config/initializeData.js';
import app from '../app.js';

let ready = null;

const prepare = async () => {
  await dbConnection();
  await initializeData(); // solo crea el admin si no existe
};

export default async function handler(req, res) {
  try {
    ready ??= prepare().catch((error) => {
      ready = null;
      throw error;
    });
    await ready;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'El servidor se está preparando. Intenta de nuevo en unos segundos.' }));
    return;
  }
  return app(req, res);
}
