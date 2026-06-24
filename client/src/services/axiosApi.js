import axios from 'axios';
import { getAccessToken, getRefreshToken, logCookies } from './token.service.js';

const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // ✅ Required for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// ✅ Request interceptor: Attach JWT token from cookie to Authorization header
axiosApi.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // ✅ Log request for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`[Axios] ${config.method?.toUpperCase()} ${config.url}`, {
        hasToken: !!token,
        withCredentials: config.withCredentials
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor with queue system for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosApi.interceptors.response.use(
  (response) => {
    // ✅ Log response for debugging (only in development)
    if (import.meta.env.DEV) {
      console.log(`[Axios] Response ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // ✅ Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error(`[Axios] Error ${error.response?.status} ${originalRequest.url}`, {
        message: error.message,
        data: error.response?.data
      });
    }

    // ✅ Trigger token refresh if 401 error occurs, the request is not already a retry, and is not the refresh request itself
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      if (isRefreshing) {
        // Queue subsequent requests while token refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosApi(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('[Axios] Refreshing access token...');
        
        // ✅ Call refresh endpoint - cookies are automatically sent with withCredentials
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
          {},
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        const newAccessToken = response.data?.data?.accessToken;
        
        if (newAccessToken) {
          console.log('[Axios] Token refreshed successfully');
          // ✅ Note: Token is already in cookie from server, we just need it for the header
          // No need to call setAccessToken - cookie is already set
          processQueue(null, newAccessToken);
          
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosApi(originalRequest);
        } else {
          console.error('[Axios] No token received from refresh');
          throw new Error('No token received');
        }
      } catch (refreshError) {
        console.error('[Axios] Refresh failed:', refreshError);
        processQueue(refreshError, null);
        // ✅ Dispatch session expired event to warn user and redirect to login
        window.dispatchEvent(new Event('auth:session_expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Helper to check if user is authenticated (cookie exists)
export const isAuthenticated = () => {
  return !!getAccessToken();
};

// ✅ Debug helper - log all cookies
export const debugCookies = () => {
  logCookies();
};

export default axiosApi;
export { axiosApi };