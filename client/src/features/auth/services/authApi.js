import axiosApi from '../../../services/axiosApi';
// ✅ Remove setAccessToken import - tokens are managed via HttpOnly cookies

export const signupApi = async (name, email, password) => {
  try {
    const res = await axiosApi.post('/auth/signup', { name, email, password });
    // ✅ Token is set in HttpOnly cookie by server
    // No need to manually set token
    return res.data?.data;
  } catch (err) {
    console.error('Signup API error:', err);
    throw err?.response?.data || err;
  }
};

export const loginApi = async (email, password) => {
  try {
    const res = await axiosApi.post('/auth/login', { email, password });
    // ✅ Token is set in HttpOnly cookie by server
    // No need to manually set token
    console.log('Login API response:', res.data);
    return res.data?.data;
  } catch (err) {
    console.error('Login API error:', err);
    throw err?.response?.data || err;
  }
};

export const logoutApi = async () => {
  try {
    const res = await axiosApi.post('/auth/logout');
    // ✅ Token is cleared from HttpOnly cookie by server
    // No need to manually clear token
    return res.data;
  } catch (err) {
    console.error('Logout API error:', err);
    throw err?.response?.data || err;
  }
};

export const refreshSessionApi = async () => {
  try {
    const res = await axiosApi.post('/auth/refresh');
    // ✅ Token is refreshed in HttpOnly cookie by server
    // No need to manually set token
    console.log('Refresh API response:', res.data);
    return res.data?.data;
  } catch (err) {
    console.error('Refresh API error:', err);
    throw err?.response?.data || err;
  }
};

export const googleLoginApi = async (googleData) => {
  try {
    const res = await axiosApi.post('/auth/google', googleData);
    // ✅ Token is set in HttpOnly cookie by server
    // No need to manually set token
    return res.data?.data;
  } catch (err) {
    console.error('Google Login API error:', err);
    throw err?.response?.data || err;
  }
};

// ✅ Helper to get user profile
export const getProfileApi = async () => {
  try {
    const res = await axiosApi.get('/users/profile');
    return res.data?.data;
  } catch (err) {
    console.error('Get profile API error:', err);
    throw err?.response?.data || err;
  }
};