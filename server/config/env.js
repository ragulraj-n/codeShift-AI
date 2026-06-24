import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Apply sensible defaults for optional variables
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codeshift';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
process.env.ALLOW_MOCK_GOOGLE = process.env.ALLOW_MOCK_GOOGLE || 'false';

// ✅ No critical validation – just log a simple message
export const validateEnv = () => {
  logger.info('🚀 Environment variables loaded with defaults.');
};

export default validateEnv;