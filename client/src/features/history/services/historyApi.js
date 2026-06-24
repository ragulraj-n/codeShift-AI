import axiosApi from '../../../services/axiosApi';

export const getHistoryApi = async () => {
  try {
    const res = await axiosApi.get('/history');
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};
