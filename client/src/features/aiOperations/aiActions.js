import { convertCodeApi, optimizeCodeApi, debugCodeApi, explainCodeApi } from './services/aiApi';
import { setLastOperation, setAiError, clearAiError } from './aiSlice';
import { setOutputCode, setReport, setEditorLoading, setOperationMode, setResultType } from '../editor/editorSlice';
import toast from 'react-hot-toast';

export const convertCodeAction = (code, sourceLang, targetLang) => async (dispatch) => {
  try {
    dispatch(setEditorLoading(true));
    dispatch(clearAiError());
    dispatch(setOperationMode('convert'));

    const result = await convertCodeApi(code, sourceLang, targetLang);
    dispatch(setOutputCode(result));
    dispatch(setResultType('code'));
    dispatch(setLastOperation('convert'));
    toast.success('Code translated successfully!');
  } catch (error) {
    const errorMsg = error?.message || 'Code conversion failed';
    dispatch(setAiError(errorMsg));
    toast.error(errorMsg);
  } finally {
    dispatch(setEditorLoading(false));
  }
};

export const optimizeCodeAction = (code, language) => async (dispatch) => {
  try {
    dispatch(setEditorLoading(true));
    dispatch(clearAiError());
    dispatch(setOperationMode('optimize'));

    const result = await optimizeCodeApi(code, language);
    dispatch(setOutputCode(result));
    dispatch(setResultType('code'));
    dispatch(setLastOperation('optimize'));
    toast.success('Code optimized successfully!');
  } catch (error) {
    const errorMsg = error?.message || 'Optimization failed';
    dispatch(setAiError(errorMsg));
    toast.error(errorMsg);
  } finally {
    dispatch(setEditorLoading(false));
  }
};

export const debugCodeAction = (code, language) => async (dispatch) => {
  try {
    dispatch(setEditorLoading(true));
    dispatch(clearAiError());
    dispatch(setOperationMode('debug'));

    const report = await debugCodeApi(code, language);
    dispatch(setReport(report));
    dispatch(setResultType('markdown'));
    dispatch(setLastOperation('debug'));
    toast.success('Code debug audit complete!');
  } catch (error) {
    const errorMsg = error?.message || 'Debugging audit failed';
    dispatch(setAiError(errorMsg));
    toast.error(errorMsg);
  } finally {
    dispatch(setEditorLoading(false));
  }
};

export const explainCodeAction = (code, language) => async (dispatch) => {
  try {
    dispatch(setEditorLoading(true));
    dispatch(clearAiError());
    dispatch(setOperationMode('explain'));

    const explanation = await explainCodeApi(code, language);
    dispatch(setReport(explanation));
    dispatch(setResultType('markdown'));
    dispatch(setLastOperation('explain'));
    toast.success('Explanation generated!');
  } catch (error) {
    const errorMsg = error?.message || 'Explanation generation failed';
    dispatch(setAiError(errorMsg));
    toast.error(errorMsg);
  } finally {
    dispatch(setEditorLoading(false));
  }
};
