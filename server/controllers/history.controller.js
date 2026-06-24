import History from '../models/History.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHistory = asyncHandler(async (req, res) => {
  const query = {};

  if (req.user) {
    // Authenticated user
    query.user = req.user._id;
  } else {
    // Guest user - filter by IP address
    query.ipAddress = req.ip;
    query.user = null;
  }

  // Return last 50 entries
  const historyList = await History.find(query)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return res.status(200).json(new ApiResponse(200, historyList, 'Request history retrieved successfully'));
});
