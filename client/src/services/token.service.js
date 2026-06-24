/**
 * Cookie-based token management
 * No localStorage used - all tokens stored in HttpOnly cookies for security
 * Cookies are set by the server and automatically sent with requests
 */

/**
 * Retrieves the access token from cookies
 * @returns {string|null} The access token or null
 */
export const getAccessToken = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith('accessToken=')) {
        const value = trimmedCookie.substring('accessToken='.length);
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading access token from cookie:', error);
    return null;
  }
};

/**
 * Note: We don't set cookies from frontend - they're set by backend
 */
export const setAccessToken = (token) => {
  console.warn('setAccessToken called - tokens are managed via HttpOnly cookies');
  return token;
};

/**
 * Clears the access token cookie
 */
export const clearAccessToken = () => {
  console.warn('clearAccessToken called - use logout endpoint to clear cookies');
};

/**
 * Checks if the user is authenticated by checking for access token in cookies
 * @returns {boolean} True if access token exists
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Gets the refresh token from cookies (for debugging only)
 */
export const getRefreshToken = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith('refreshToken=')) {
        const value = trimmedCookie.substring('refreshToken='.length);
        return decodeURIComponent(value);
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading refresh token from cookie:', error);
    return null;
  }
};

/**
 * Logs all cookies for debugging
 */
export const logCookies = () => {
  console.log('=== Cookie Debug Info ===');
  console.log('All cookies:', document.cookie);
  console.log('Access token present:', !!getAccessToken());
  console.log('Refresh token present:', !!getRefreshToken());
  console.log('=========================');
};

export default {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  isAuthenticated,
  getRefreshToken,
  logCookies
};