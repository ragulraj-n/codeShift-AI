import { createSlice } from '@reduxjs/toolkit';

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

// ✅ Initialize state based on cookie presence
const initialState = {
  user: null,
  isAuthenticated: false,  // ✅ always false until verified by the server
  loading: false,
  error: null
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.error = null;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const { setUser, clearUser, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;