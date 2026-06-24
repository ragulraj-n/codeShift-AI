import axiosApi from '../../../services/axiosApi';

export const addFavoriteApi = async (projectId) => {
  try {
    const res = await axiosApi.post('/favorites', { projectId });
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const removeFavoriteApi = async (projectId) => {
  try {
    const res = await axiosApi.delete(`/favorites/${projectId}`);
    return res.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const listFavoritesApi = async () => {
  try {
    const res = await axiosApi.get('/favorites');
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};
