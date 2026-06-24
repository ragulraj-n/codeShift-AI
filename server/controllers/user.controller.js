import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ERROR_MESSAGES } from '../config/errorMessages.js';
import logger from '../utils/logger.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(200, user, 'User profile retrieved successfully'));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;

  await user.save();

  const updatedUser = await User.findById(req.user._id).select('-password');

  return res.status(200).json(new ApiResponse(200, updatedUser, 'Profile updated successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Social Google Auth users don't have passwords
  if (user.googleId && !user.password) {
    throw new ApiError(400, 'Social Google accounts do not have a password configured.');
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid current password');
  }

  user.password = newPassword;
  await user.save();

  // Invalidate all refresh tokens for this user
  await RefreshToken.deleteMany({ user: user._id });

  logger.info(`Password changed for user: ${user.email}. Revoked all active sessions.`, { requestId: req.requestId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      'Password changed successfully. All other sessions have been logged out.'
    )
  );
});
