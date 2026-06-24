import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lastOperation: null,
  error: null
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setLastOperation: (state, action) => {
      state.lastOperation = action.payload;
    },
    setAiError: (state, action) => {
      state.error = action.payload;
    },
    clearAiError: (state) => {
      state.error = null;
    }
  }
});

export const { setLastOperation, setAiError, clearAiError } = aiSlice.actions;
export default aiSlice.reducer;
