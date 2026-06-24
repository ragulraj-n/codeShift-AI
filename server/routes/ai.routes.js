import { Router } from 'express';
import { convert, optimize, debug, explain } from '../controllers/ai.controller.js';
import { optionalJWT } from '../middlewares/auth.middleware.js';
import { createRateLimiter } from '../utils/createRateLimiter.js';

const router = Router();

// Rate limit: 100 requests per hour (3600000 ms)
const aiRateLimiter = createRateLimiter(
  100,
  60 * 60 * 1000,
  'You have reached the rate limit of 100 requests per hour for AI operations.'
);

// Apply optional auth first to identify user if logged in, then apply user-specific or IP-specific rate limiting
router.use(optionalJWT);
router.use(aiRateLimiter);

router.post('/convert', convert);
router.post('/optimize', optimize);
router.post('/debug', debug);
router.post('/explain', explain);

export default router;
