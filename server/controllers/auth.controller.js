import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { TOKEN_CONFIG } from '../config/token.config.js';
import { ERROR_MESSAGES } from '../config/errorMessages.js';
import logger from '../utils/logger.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to extract fingerprint from user-agent and IP
const generateFingerprint = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.socket.remoteAddress || '';
  const rawFingerprint = `${userAgent}-${ip}`;
  const hash = crypto.createHash('sha256').update(rawFingerprint).digest('hex');
  return hash;
};

// ✅ Helper to set refresh token cookie options
const getRefreshCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    signed: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
};

// ✅ Helper to set access token cookie options
const getAccessCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    signed: true,
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 minutes
  };
};

/**
 * Generate Access and Refresh tokens
 */
const generateAccessAndRefreshTokens = async (userId, fingerprint) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found for token generation');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // ✅ Delete any existing used refresh tokens for this user to prevent buildup
  // await RefreshToken.deleteMany({ user: userId, isUsed: true });

  const storedToken = await RefreshToken.create({
    token: refreshToken,
    user: userId,
    expiresAt,
    fingerprint
  });

  return { accessToken, refreshToken, tokenId: storedToken._id };
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  if (!email.includes('@') || !email.includes('.')) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters long');
  }

  const emailNormalized = email.trim().toLowerCase();
  const existedUser = await User.findOne({ email: emailNormalized });
  if (existedUser) {
    throw new ApiError(409, ERROR_MESSAGES.AUTH.USER_EXISTS);
  }

  const isDevEnvironment = process.env.NODE_ENV !== 'production';
  const isEmailVerified = isDevEnvironment || false;

  const user = await User.create({
    name: name.trim(),
    email: emailNormalized,
    password,
    isEmailVerified: isEmailVerified,
    emailVerificationToken: isDevEnvironment ? undefined : crypto.randomBytes(32).toString('hex'),
    emailVerificationExpires: isDevEnvironment ? undefined : new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  const createdUser = await User.findById(user._id).select('-password');
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  if (isDevEnvironment) {
    const fingerprint = generateFingerprint(req);
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, fingerprint);
    const loggedInUser = await User.findById(user._id).select('-password');

    logger.info(`User registered and auto-logged in: ${emailNormalized} (development mode)`, { requestId: req.requestId });

    // ✅ Set BOTH cookies
    return res
      .status(201)
      .cookie('refreshToken', refreshToken, getRefreshCookieOptions())
      .cookie('accessToken', accessToken, getAccessCookieOptions())
      .json(
        new ApiResponse(
          201,
          { user: loggedInUser, accessToken },
          'Registration successful. You are now logged in.'
        )
      );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        'Registration successful. Please verify your email before logging in.'
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const emailNormalized = email.trim().toLowerCase();
  const user = await User.findOne({ email: emailNormalized });
  if (!user) {
    throw new ApiError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  // ✅ Log user found
  logger.info(`Login attempt for user: ${emailNormalized}`, { requestId: req.requestId });

  // Account Lockout Check
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    throw new ApiError(423, `Account is temporarily locked. Try again after ${minutesLeft} minutes.`);
  }

  // Active status check
  if (!user.isActive) {
    throw new ApiError(403, ERROR_MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
  }

  // Google OAuth account check
  if (user.googleId && !user.password) {
    throw new ApiError(400, 'Account was created using Google. Please log in with Google.');
  }

  // Email verification check - SKIP in development
  const isDevEnvironment = process.env.NODE_ENV !== 'production';
  if (!user.isEmailVerified && !user.googleId && !isDevEnvironment) {
    throw new ApiError(403, ERROR_MESSAGES.AUTH.EMAIL_UNVERIFIED);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      throw new ApiError(423, ERROR_MESSAGES.AUTH.ACCOUNT_LOCKED);
    }
    await user.save();
    throw new ApiError(401, ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
  }

  // Reset lockout tracking on success
  if (user.loginAttempts > 0 || user.lockUntil) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();
  }

  const fingerprint = generateFingerprint(req);
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, fingerprint);

  const loggedInUser = await User.findById(user._id).select('-password');

  logger.info(`User logged in successfully: ${emailNormalized}`, { requestId: req.requestId });

  // ✅ Set BOTH cookies - access token AND refresh token
  return res
    .status(200)
    .cookie('refreshToken', refreshToken, getRefreshCookieOptions())
    .cookie('accessToken', accessToken, getAccessCookieOptions())
    .json(
      new ApiResponse(
        200,
        { 
          user: loggedInUser, 
          accessToken // ✅ Still return in body for client state
        },
        'User logged in successfully'
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // ✅ Check both signed and unsigned cookies
  const token = req.signedCookies?.refreshToken || req.cookies?.refreshToken;
  if (token) {
    await RefreshToken.deleteOne({ token });
  }

  logger.info('User logged out', { requestId: req.requestId });

  // ✅ Clear BOTH cookies
  return res
    .status(200)
    .clearCookie('refreshToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true
    })
    .clearCookie('accessToken', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      signed: true
    })
    .json(new ApiResponse(200, {}, 'User logged out successfully'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const storedToken = req.refreshTokenDoc;

  if (!storedToken) {
    throw new ApiError(401, 'No refresh token found');
  }

  const user = await User.findById(storedToken.user);
  if (!user) {
    throw new ApiError(403, 'Invalid token payload. User not found.');
  }

  const currentFingerprint = generateFingerprint(req);

  const { accessToken, refreshToken: newRefreshToken, tokenId: newRefreshTokenId } = await generateAccessAndRefreshTokens(
    user._id,
    currentFingerprint
  );

  // Mark old token as used
  storedToken.isUsed = true;
  storedToken.replacedBy = newRefreshTokenId;
  await storedToken.save();

  logger.info(`Session token rotated for user: ${user.email}`, { 
    requestId: req.requestId
  });

  // ✅ Set BOTH cookies
  return res
    .status(200)
    .cookie('refreshToken', newRefreshToken, getRefreshCookieOptions())
    .cookie('accessToken', accessToken, getAccessCookieOptions())
    .json(
      new ApiResponse(
        200,
        { 
          accessToken, 
          user: { _id: user._id, email: user.email, name: user.name } 
        },
        'Access token refreshed successfully'
      )
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  logger.info(`Email verified successfully for user: ${user.email}`, { requestId: req.requestId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      'Email verified successfully. You can now log in.'
    )
  );
});

export const googleOAuthLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(400, 'Google OAuth credential token is required');
  }

  try {
    let payload;
    if (process.env.NODE_ENV !== 'production' && process.env.ALLOW_MOCK_GOOGLE === 'true' && credential.startsWith('mock_')) {
      logger.info('Using mock Google Login bypass in development');
      try {
        payload = JSON.parse(credential.substring(5));
      } catch (e) {
        payload = {
          sub: 'mock_google_id_12345',
          email: 'mockuser@example.com',
          name: 'Mock Google User',
          picture: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Mock'
        };
      }
    } else {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    }
    const { sub: googleId, email, name, picture: avatar } = payload;

    if (!email) {
      throw new ApiError(400, 'Google account email is missing or private');
    }

    const emailNormalized = email.trim().toLowerCase();
    let user = await User.findOne({ email: emailNormalized });

    if (user && !user.isActive) {
      throw new ApiError(403, ERROR_MESSAGES.AUTH.ACCOUNT_DEACTIVATED);
    }

    if (!user) {
      user = await User.create({
        name,
        email: emailNormalized,
        googleId,
        avatar: avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${name}`,
        isEmailVerified: true
      });
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
        user.isEmailVerified = true;
        if (!user.avatar) user.avatar = avatar;
        await user.save();
      }
    }

    const fingerprint = generateFingerprint(req);
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, fingerprint);
    const loggedInUser = await User.findById(user._id).select('-password');

    logger.info(`Google Login successful: ${emailNormalized}`, { requestId: req.requestId });

    // ✅ Set BOTH cookies
    return res
      .status(200)
      .cookie('refreshToken', refreshToken, getRefreshCookieOptions())
      .cookie('accessToken', accessToken, getAccessCookieOptions())
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken },
          'Google login successful'
        )
      );
  } catch (error) {
    logger.error('Google token verification failed:', error);
    throw new ApiError(401, `Invalid Google token: ${error.message}`);
  }
});