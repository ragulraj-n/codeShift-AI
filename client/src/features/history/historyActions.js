import { getHistoryApi } from './services/historyApi';
import { setHistory, setHistoryLoading } from './historySlice';
import toast from 'react-hot-toast';

export const fetchHistoryAction = () => async (dispatch) => {
  try {
    dispatch(setHistoryLoading(true));
    const list = await getHistoryApi();
    dispatch(setHistory(list));
  } catch (error) {
    console.error('Failed to fetch history:', error);
  } finally {
    dispatch(setHistoryLoading(false));
  }
};
