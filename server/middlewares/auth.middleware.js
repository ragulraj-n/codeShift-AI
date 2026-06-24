import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { TOKEN_CONFIG } from '../config/token.config.js';
import { ERROR_MESSAGES } from '../config/errorMessages.js';
import logger from '../utils/logger.js';

// ✅ Track refresh operations in progress to prevent race conditions
const refreshInProgress = new Map();

// Helper to generate fingerprint
const getFingerprintHash = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.socket.remoteAddress || '';
  const rawFingerprint = `${userAgent}-${ip}`;
  return crypto.createHash('sha256').update(rawFingerprint).digest('hex');
};

// Strict access token validation - checks Authorization header or cookies
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // ✅ Check both Authorization header and signed cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.signedCookies?.accessToken || 
                  req.cookies?.accessToken;
    
    if (!token) {
      throw new ApiError(401, 'Unauthorized request. Access token is missing.');
    }

    const decodedToken = jwt.verify(token, TOKEN_CONFIG.access.secret);
    
    const user = await User.findById(decodedToken?._id).select('-password');
    if (!user) {
      throw new ApiError(401, 'Invalid access token. User not found.');
    }

    req.user = user;
    next();
  } catch (error) {
    // ✅ Better error handling for expired tokens
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Access token expired. Please refresh.');
    }
    throw new ApiError(401, error?.message || 'Invalid access token.');
  }
});

// Optional access token validation - doesn't fail request if missing
export const optionalJWT = asyncHandler(async (req, res, next) => {
  try {
    // ✅ Check both Authorization header and signed cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.signedCookies?.accessToken || 
                  req.cookies?.accessToken;
    
    if (token) {
      const decodedToken = jwt.verify(token, TOKEN_CONFIG.access.secret);
      const user = await User.findById(decodedToken?._id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    // Fail silently and proceed as guest
    next();
  }
});

// ✅ Updated refresh token verification with race condition prevention
export const verifyRefreshToken = asyncHandler(async (req, res, next) => {
  // ✅ Check both signed and unsigned cookies (order matters)
  const incomingRefreshToken = req.signedCookies?.refreshToken || 
                              req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    logger.warn('Refresh token missing in request', { 
      requestId: req.requestId,
      cookies: Object.keys(req.cookies || {}),
      signedCookies: Object.keys(req.signedCookies || {})
    });
    throw new ApiError(401, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  // ✅ Check if refresh is already in progress for this token
  if (refreshInProgress.has(incomingRefreshToken)) {
    logger.info(`⏳ Refresh token operation in progress for token: ${incomingRefreshToken.substring(0, 20)}...`, { 
      requestId: req.requestId 
    });
    
    // Wait for the existing operation to complete
    try {
      const result = await refreshInProgress.get(incomingRefreshToken);
      if (result) {
        req.refreshTokenDoc = result;
        return next();
      }
    } catch (error) {
      // If the existing operation failed, remove from map and continue
      refreshInProgress.delete(incomingRefreshToken);
    }
  }

  // ✅ Create a promise that will be resolved when the refresh completes
  let resolveRefresh;
  let rejectRefresh;
  const refreshPromise = new Promise((resolve, reject) => {
    resolveRefresh = resolve;
    rejectRefresh = reject;
  });
  
  // Store the promise in the map
  refreshInProgress.set(incomingRefreshToken, refreshPromise);

  try {
    const storedToken = await RefreshToken.findOne({ token: incomingRefreshToken });
    
    if (!storedToken) {
      logger.warn('Refresh token not found in database', { 
        requestId: req.requestId,
        tokenPrefix: incomingRefreshToken.substring(0, 20)
      });
      refreshInProgress.delete(incomingRefreshToken);
      throw new ApiError(401, ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // Detect token reuse / revocation
    if (storedToken.isUsed || storedToken.revoked) {
      // 15-second grace period to protect against parallel client request race conditions
      const gracePeriodLimit = new Date(storedToken.updatedAt.getTime() + 15 * 1000);
      const now = new Date();
      if (storedToken.isUsed && now <= gracePeriodLimit && storedToken.replacedBy) {
        logger.info(`🔄 Grace period refresh token swap for user: ${storedToken.user}`, { requestId: req.requestId });
        const replacedToken = await RefreshToken.findById(storedToken.replacedBy);
        if (replacedToken) {
          // Resolve the promise with the replaced token
          resolveRefresh(replacedToken);
          refreshInProgress.delete(incomingRefreshToken);
          req.refreshTokenDoc = replacedToken;
          return next();
        }
      }

      // Invalidate all tokens for security
      await RefreshToken.deleteMany({ user: storedToken.user });
      logger.warn(`🚨 SECURITY BREACH: Refresh token reuse detected for user ${storedToken.user}. Revoked all sessions.`, { 
        requestId: req.requestId,
        tokenId: storedToken._id,
        isUsed: storedToken.isUsed,
        revoked: storedToken.revoked
      });
      refreshInProgress.delete(incomingRefreshToken);
      throw new ApiError(403, ERROR_MESSAGES.AUTH.SESSION_COMPROMISED);
    }

    // Detect expiration
    const now = new Date();
    if (now > storedToken.expiresAt) {
      logger.warn('Refresh token expired', { 
        requestId: req.requestId,
        expiresAt: storedToken.expiresAt,
        now: now
      });
      refreshInProgress.delete(incomingRefreshToken);
      throw new ApiError(401, ERROR_MESSAGES.AUTH.SESSION_EXPIRED);
    }

    // Validate fingerprint
    const currentFingerprint = getFingerprintHash(req);
    if (storedToken.fingerprint !== currentFingerprint) {
      logger.warn(`🚨 SECURITY ALERT: Token fingerprint mismatch for user ${storedToken.user}`, { 
        requestId: req.requestId,
        storedFingerprint: storedToken.fingerprint.substring(0, 10),
        currentFingerprint: currentFingerprint.substring(0, 10)
      });
      refreshInProgress.delete(incomingRefreshToken);
      throw new ApiError(401, ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    }

    // Resolve the promise with the stored token
    resolveRefresh(storedToken);
    refreshInProgress.delete(incomingRefreshToken);
    
    req.refreshTokenDoc = storedToken;
    next();
  } catch (error) {
    // Clean up the map if there's an error
    refreshInProgress.delete(incomingRefreshToken);
    if (rejectRefresh) {
      rejectRefresh(error);
    }
    // Re-throw the error
    throw error;
  }
});

// ✅ Helper to clear refresh token cookie
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    signed: true
  });
};

// ✅ Helper to clear access token cookie
export const clearAccessTokenCookie = (res) => {
  res.clearCookie('accessToken', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    signed: true
  });
};