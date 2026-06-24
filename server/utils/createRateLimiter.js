import rateLimit from 'express-rate-limit';
import { ApiError } from './ApiError.js';
import logger from './logger.js';

/**
 * Creates a rate limiter middleware.
 * @param {number} limit - Max number of requests per windowMs.
 * @param {number} windowMs - Time window in milliseconds.
 * @param {string} message - Error message on limit exceed.
 */
export const createRateLimiter = (limit = 100, windowMs = 60 * 60 * 1000, message = 'Too many requests, please try again later.') => {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    keyGenerator: (req) => {
      // If user is authenticated, limit by user ID.
      // Otherwise, limit by composite IP + User-Agent string to distinguish multiple guests on same NAT IP.
      if (req.user?._id) {
        return req.user._id.toString();
      }
      const userAgent = req.headers['user-agent'] || '';
      return `${req.ip}-${userAgent}`;
    },
    handler: (req, res, next) => {
      logger.warn(`Rate limit exceeded for path ${req.originalUrl}. ReqID: ${req.requestId || 'none'}`, { 
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      next(new ApiError(429, message));
    }
  });
};

export default createRateLimiter;
