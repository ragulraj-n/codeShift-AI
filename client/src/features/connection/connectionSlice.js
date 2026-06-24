import { createSlice } from '@reduxjs/toolkit';

const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    connections: [],
    loading: false
  },
  reducers: {
    setConnections: (state, action) => {
      state.connections = action.payload;
    }
  }
});

export const { setConnections } = connectionSlice.actions;
export default connectionSlice.reducer;
