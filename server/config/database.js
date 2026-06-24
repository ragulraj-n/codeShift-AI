import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeshift';

// Connection event listeners
mongoose.connection.on('connected', () => {
  logger.info('💚 Mongoose default connection is open.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`❌ Mongoose default connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Mongoose default connection is disconnected.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('💚 Mongoose default connection has reconnected.');
});

// Graceful shutdown listener
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Mongoose default connection disconnected through app termination.');
    process.exit(0);
  } catch (err) {
    logger.error('Error during Mongoose connection closure:', err);
    process.exit(1);
  }
});

const connectWithRetry = async (attempt = 1, delay = 1000) => {
  const maxAttempts = 5;
  try {
    const connectionInstance = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of default 30s
    });
    logger.info(`💚 MongoDB Connected! Db Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error(`❌ MongoDB connection attempt ${attempt}/${maxAttempts} failed. Error: ${error.message}`);
    
    if (attempt < maxAttempts) {
      const nextDelay = delay * 2;
      logger.info(`🔄 Retrying database connection in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return connectWithRetry(attempt + 1, nextDelay);
    } else {
      logger.error('❌ MongoDB maximum connection attempts exceeded. Terminating server...');
      process.exit(1);
    }
  }
};

export const connectDB = async () => {
  await connectWithRetry();
};

export default connectDB;
