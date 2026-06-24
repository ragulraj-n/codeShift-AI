import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favorites: [],
  loading: false
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    addFavoriteToState: (state, action) => {
      state.favorites.push(action.payload);
    },
    removeFavoriteFromState: (state, action) => {
      state.favorites = state.favorites.filter((fav) => fav.project?._id !== action.payload);
    },
    setFavoritesLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setFavorites,
  addFavoriteToState,
  removeFavoriteFromState,
  setFavoritesLoading
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
