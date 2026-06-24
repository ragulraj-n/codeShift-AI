export const ERROR_MESSAGES = {
  AUTH: {
    REQUIRED_FIELDS: 'Email and password are required',
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User with this email already exists',
    UNAUTHORIZED: 'Unauthorized request. Access token is missing or invalid.',
    SESSION_EXPIRED: 'Session has expired. Please log in again.',
    SESSION_REVOKED: 'Session has been revoked.',
    SESSION_COMPROMISED: 'Compromised session token detected. All sessions revoked.',
    ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact support.',
    ACCOUNT_LOCKED: 'Account is temporarily locked. Please try again after 15 minutes.',
    EMAIL_UNVERIFIED: 'Please verify your email address before logging in.',
    GOOGLE_AUTH_FAILED: 'Google authentication failed',
    PASSWORD_COMPLEXITY: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
  },
  PROJECT: {
    NOT_FOUND: 'Project not found',
    UNAUTHORIZED: 'You do not have permission to access this project',
    EXISTS: 'A project with this name already exists in this folder'
  },
  FOLDER: {
    NOT_FOUND: 'Folder not found',
    EXISTS: 'A folder with this name already exists in this parent folder'
  }
};

export default ERROR_MESSAGES;
