import axiosApi from '../../../services/axiosApi';

export const generateShareLinkApi = async (projectId) => {
  try {
    const res = await axiosApi.post('/sharing', { projectId });
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const getSharedProjectApi = async (shareToken) => {
  try {
    const res = await axiosApi.get(`/sharing/${shareToken}`);
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const forkProjectApi = async (projectId) => {
  try {
    const res = await axiosApi.post('/sharing/fork', { projectId });
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};
