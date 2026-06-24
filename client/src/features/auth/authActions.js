import { 
  signupApi, 
  loginApi, 
  logoutApi, 
  refreshSessionApi, 
  googleLoginApi 
} from './services/authApi';
import { setUser, clearUser, setLoading, setError } from './authSlice';
import toast from 'react-hot-toast';
import axiosApi from '../../services/axiosApi';

// ✅ Check if access token exists in cookies
const hasAccessToken = () => {
  try {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith('accessToken=')) {
        return true;
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const signupAction = (name, email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await signupApi(name, email, password);
    dispatch(setUser(data.user));
    toast.success(`Welcome to CodeShift, ${data.user.name}!`);
    return data.user;
  } catch (error) {
    const errorMsg = error?.message || 'Registration failed';
    dispatch(setError(errorMsg));
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const loginAction = (email, password) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await loginApi(email, password);
    dispatch(setUser(data.user));
    toast.success(`Welcome back, ${data.user.name}!`);
    return data.user;
  } catch (error) {
    const errorMsg = error?.message || 'Login failed';
    dispatch(setError(errorMsg));
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const logoutAction = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    await logoutApi();
    dispatch(clearUser());
    toast.success('Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    dispatch(clearUser());
  } finally {
    dispatch(setLoading(false));
  }
};

export const googleLoginAction = (googleData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await googleLoginApi(googleData);
    dispatch(setUser(data.user));
    toast.success(`Welcome, ${data.user.name}!`);
    return data.user;
  } catch (error) {
    const errorMsg = error?.message || 'Google Login failed';
    dispatch(setError(errorMsg));
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

// ✅ Check auth session - called only on app initialization
export const checkAuthSession = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // ✅ Always attempt to get user profile
    try {
      const response = await axiosApi.get('/users/profile');
      if (response.data?.data) {
        dispatch(setUser(response.data.data));
        dispatch(setLoading(false));
        return true;
      }
    } catch (profileError) {
      // ✅ If profile fetch fails with 401, try to refresh the token
      if (profileError.response?.status === 401) {
        try {
          const refreshData = await refreshSessionApi();
          if (refreshData?.user) {
            dispatch(setUser(refreshData.user));
            dispatch(setLoading(false));
            return true;
          }
        } catch (refreshError) {
          // ✅ Refresh failed → session is invalid
          console.error('Refresh failed:', refreshError);
        }
      } else {
        // ✅ Other errors (network, 500, etc.) – just log and treat as unauthenticated
        console.error('Profile fetch error:', profileError);
      }
    }
    
    // ✅ If we reached here, session is invalid
    dispatch(clearUser());
    dispatch(setLoading(false));
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    dispatch(clearUser());
    dispatch(setLoading(false));
    return false;
  }
};

export const refreshSession = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const data = await refreshSessionApi();
    if (data?.user) {
      dispatch(setUser(data.user));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Refresh session failed:', error);
    dispatch(clearUser());
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};