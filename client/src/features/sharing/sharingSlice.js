import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sharedProject: null,
  shareUrl: '',
  loading: false,
  error: null
};

const sharingSlice = createSlice({
  name: 'sharing',
  initialState,
  reducers: {
    setSharedProject: (state, action) => {
      state.sharedProject = action.payload;
      state.error = null;
    },
    setShareUrl: (state, action) => {
      state.shareUrl = action.payload;
    },
    setSharingLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSharingError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setSharedProject,
  setShareUrl,
  setSharingLoading,
  setSharingError
} = sharingSlice.actions;

export default sharingSlice.reducer;
