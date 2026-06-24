import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  historyList: [],
  loading: false
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    setHistory: (state, action) => {
      state.historyList = action.payload;
    },
    addHistoryEntry: (state, action) => {
      state.historyList.unshift(action.payload);
      if (state.historyList.length > 50) {
        state.historyList.pop(); // keep last 50
      }
    },
    setHistoryLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const { setHistory, addHistoryEntry, setHistoryLoading } = historySlice.actions;
export default historySlice.reducer;
