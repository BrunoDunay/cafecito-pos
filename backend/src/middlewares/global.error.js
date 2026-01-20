import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, '../../logs/error.log');

const ensureLogDir = () => {
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const setupGlobalErrorHandlers = () => {
  ensureLogDir();

  process.on('uncaughtException', (error) => {
    const log = `${new Date().toISOString()} | UNCAUGHT_EXCEPTION | ${error.message}\n${error.stack}\n\n`;
    fs.appendFileSync(logFilePath, log);
    console.error('Uncaught exception logged');
  });

  process.on('unhandledRejection', (reason) => {
    const log = `${new Date().toISOString()} | UNHANDLED_REJECTION | ${reason}\n\n`;
    fs.appendFileSync(logFilePath, log);
    console.error('Unhandled rejection logged');
  });
};

export default setupGlobalErrorHandlers;
