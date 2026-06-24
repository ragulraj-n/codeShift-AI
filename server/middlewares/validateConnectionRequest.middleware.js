import { body } from 'express-validator';
import { validateRequest } from './validateRequest.middleware.js';

export const validateConnectionRequest = [
  body('receiverId')
    .trim()
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid Receiver ID format'),
  validateRequest
];

export default validateConnectionRequest;
