// src/middleware/requestLogger.js
import morgan from 'morgan';
import logger from '../utils/logger.js';

// Pipe morgan into winston
const stream = { write: (msg) => logger.http(msg.trim()) };

const requestLogger = morgan(
  ':remote-addr :method :url :status :res[content-length] - :response-time ms',
  { stream },
);

export default requestLogger;