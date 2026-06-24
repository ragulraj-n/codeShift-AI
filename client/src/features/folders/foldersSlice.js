import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  folders: [],
  loading: false,
  error: null
};

const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setFolders: (state, action) => {
      state.folders = action.payload;
    },
    addFolderToState: (state, action) => {
      state.folders.push(action.payload);
    },
    updateFolderInState: (state, action) => {
      const index = state.folders.findIndex((f) => f._id === action.payload._id);
      if (index !== -1) {
        state.folders[index] = action.payload;
      }
    },
    removeFolderFromState: (state, action) => {
      state.folders = state.folders.filter((f) => f._id !== action.payload);
    },
    setFoldersLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setFolders,
  addFolderToState,
  updateFolderInState,
  removeFolderFromState,
  setFoldersLoading
} = foldersSlice.actions;

export default foldersSlice.reducer;
