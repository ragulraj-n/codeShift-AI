import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncLocalStorage } from './asyncStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom winston format to auto-attach request ID from AsyncStorage
const appendRequestId = winston.format((info) => {
  const store = asyncLocalStorage.getStore();
  if (store?.requestId) {
    info.requestId = store.requestId;
  }
  return info;
});

const logFormat = winston.format.printf(({ timestamp, level, message, requestId, stack }) => {
  const store = asyncLocalStorage.getStore();
  const reqId = requestId || store?.requestId;
  const reqIdStr = reqId ? ` [ReqID: ${reqId}]` : '';
  const messageBody = stack || message;
  return `${timestamp} [${level.toUpperCase()}]${reqIdStr}: ${messageBody}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    appendRequestId(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'codeshift-service' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add console transport with readable formatting for local development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      logFormat
    )
  }));
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

export default logger;
export { logger };
