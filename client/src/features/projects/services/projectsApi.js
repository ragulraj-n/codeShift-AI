import axiosApi from '../../../services/axiosApi';

export const createProjectApi = async (projectData) => {
  try {
    const res = await axiosApi.post('/projects', projectData);
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const updateProjectApi = async (projectId, projectData) => {
  try {
    const res = await axiosApi.patch(`/projects/${projectId}`, projectData);
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const deleteProjectApi = async (projectId) => {
  try {
    const res = await axiosApi.delete(`/projects/${projectId}`);
    return res.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const getProjectApi = async (projectId) => {
  try {
    const res = await axiosApi.get(`/projects/${projectId}`);
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const listProjectsApi = async (params = {}) => {
  try {
    const res = await axiosApi.get('/projects', { params });
    return res.data?.data;
  } catch (err) {
    throw err?.response?.data || err;
  }
};
