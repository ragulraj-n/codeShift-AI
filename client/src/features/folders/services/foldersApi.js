import axiosApi from '../../../services/axiosApi';

export const createFolderApi = async (name, parentFolderId) => {
  try {
    const res = await axiosApi.post('/folders', { name, parentFolderId });
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const renameFolderApi = async (folderId, name) => {
  try {
    const res = await axiosApi.patch(`/folders/${folderId}`, { name });
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const deleteFolderApi = async (folderId) => {
  try {
    const res = await axiosApi.delete(`/folders/${folderId}`);
    return res.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const listFoldersApi = async () => {
  try {
    const res = await axiosApi.get('/folders');
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};
