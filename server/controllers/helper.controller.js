import { ApiResponse } from '../utils/ApiResponse.js';
import { SUPPORTED_LANGUAGES, RATE_LIMITS } from '../config/constant.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getSystemConfig = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        supportedLanguages: SUPPORTED_LANGUAGES,
        rateLimits: RATE_LIMITS,
        apiVersion: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      'System configurations retrieved successfully'
    )
  );
});
