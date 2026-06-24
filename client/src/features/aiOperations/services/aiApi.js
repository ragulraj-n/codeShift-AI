import axiosApi from '../../../services/axiosApi';

export const convertCodeApi = async (code, sourceLang, targetLang) => {
  try {
    const res = await axiosApi.post('/ai/convert', { code, sourceLang, targetLang });
    return res.data?.data?.outputCode;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const optimizeCodeApi = async (code, language) => {
  try {
    const res = await axiosApi.post('/ai/optimize', { code, language });
    return res.data?.data?.outputCode;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const debugCodeApi = async (code, language) => {
  try {
    const res = await axiosApi.post('/ai/debug', { code, language });
    return res.data?.data?.report;
  } catch (err) {
    throw err?.response?.data || err;
  }
};

export const explainCodeApi = async (code, language) => {
  try {
    const res = await axiosApi.post('/ai/explain', { code, language });
    return res.data?.data?.explanation;
  } catch (err) {
    throw err?.response?.data || err;
  }
};
