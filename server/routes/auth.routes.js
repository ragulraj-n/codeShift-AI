import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  googleOAuthLogin,
  verifyEmail
} from '../controllers/auth.controller.js';
import { validateSignup, validateLogin } from '../middlewares/authValidate.middleware.js';
import { verifyRefreshToken } from '../middlewares/auth.middleware.js';
import { createRateLimiter } from '../utils/createRateLimiter.js';

const router = Router();

// Strict rate limiter for auth submission routes (10 attempts per 15 minutes)
const authSubmissionLimiter = createRateLimiter(
  10, 
  15 * 60 * 1000, 
  'Too many auth attempts. Please try again after 15 minutes.'
);

// High-capacity rate limiter for token refreshes (100 refreshes per 15 minutes)
const refreshRateLimiter = createRateLimiter(
  100,
  15 * 60 * 1000,
  'Too many token refresh attempts. Please try again later.'
);

router.post('/signup', authSubmissionLimiter, validateSignup, registerUser);
router.post('/login', authSubmissionLimiter, validateLogin, loginUser);
router.post('/google', authSubmissionLimiter, googleOAuthLogin);
router.get('/verify-email/:token', verifyEmail);

// Refresh route must run rate limiter and verifyRefreshToken before rotating tokens
router.post('/refresh', refreshRateLimiter, verifyRefreshToken, refreshAccessToken);

router.post('/logout', logoutUser);

export default router;
