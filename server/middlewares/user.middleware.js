import { ApiError } from '../utils/ApiError.js';

export const checkUserActive = (req, res, next) => {
  if (req.user && !req.user.isActive) {
    throw new ApiError(403, 'Your account is inactive. Please contact support.');
  }
  next();
};

export default checkUserActive;
