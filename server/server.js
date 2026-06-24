import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// Define ES Modules path utilities
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import configurations
import { validateEnv } from './config/env.js';
import connectDB from './config/database.js';
import { initTokenCleanupCron } from './utils/tokenCleanup.js';
import logger from './utils/logger.js';
import { asyncLocalStorage } from './utils/asyncStorage.js';

// Middlewares
import { errorHandler } from './middlewares/errorHandler.js';

// Route imports
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import folderRouter from './routes/folder.routes.js';
import favoriteRouter from './routes/favorite.routes.js';
import historyRouter from './routes/history.routes.js';
import sharingRouter from './routes/sharing.routes.js';
import aiRouter from './routes/ai.routes.js';
import userRouter from './routes/user.routes.js';
import connectionRouter from './routes/connection.routes.js';
import feedRouter from './routes/feed.routes.js';
import helperRouter from './routes/helper.routes.js';
import searchRouter from './routes/search.routes.js';

// 1. Validate environment variables before doing anything else
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable proxy trust (highly recommended for Vercel/Render behind reverse proxies)
app.set('trust proxy', 1);

// 2. Connect to MongoDB
connectDB();

// 3. Initialize background token cron cleanups
initTokenCleanupCron();

// 4. Request ID Generation Middleware
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  asyncLocalStorage.run({ requestId: req.requestId }, () => {
    next();
  });
});

// 5. Morgan Logging Configuration connected to Winston logger
morgan.token('requestId', (req) => req.requestId);
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - ReqID: :requestId';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// 6. Security Header Customizations (Helmet CSP configs)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api-inference.huggingface.co"],
      imgSrc: ["'self'", "data:", "https://api.dicebear.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
}));

// 7. CORS setup with environment variable validations
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // ✅ Must be true for cookies
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
  })
);

// Explicit preflight OPTIONS response handling
app.options('*', cors());

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Cookie parser with secret
app.use(cookieParser(process.env.COOKIE_SECRET || 'your-secret-key-at-least-32-chars-long'));

// 8. Health check endpoint (expanded with DB & memory diagnostic info)
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    env: process.env.NODE_ENV || 'development',
    database: dbStatus
  });
});

// 9. API Routes
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/folders', folderRouter);
app.use('/api/favorites', favoriteRouter);
app.use('/api/history', historyRouter);
app.use('/api/sharing', sharingRouter);
app.use('/api/ai', aiRouter);
app.use('/api/users', userRouter);
app.use('/api/connections', connectionRouter);
app.use('/api/feed', feedRouter);
app.use('/api/helpers', helperRouter);
app.use('/api/search', searchRouter);

// 10. Production Static Build Files Serving (SPA Fallback routing)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res, next) => {
    if (req.url.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 11. Error handling middleware
app.use(errorHandler);

// 12. Graceful Shutdown & Uncaught Exception handlers
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception: ', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at: ', promise, ' reason: ', reason);
});

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down server gracefully...`);
  
  mongoose.connection.close(() => {
    logger.info('Mongoose connection closed due to app termination.');
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 CodeShift server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});