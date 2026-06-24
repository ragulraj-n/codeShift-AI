import { addFavoriteApi, removeFavoriteApi, listFavoritesApi } from './services/favoritesApi';
import {
  setFavorites,
  addFavoriteToState,
  removeFavoriteFromState,
  setFavoritesLoading
} from './favoritesSlice';
import { updateProjectInState } from '../projects/projectsSlice';
import toast from 'react-hot-toast';

export const fetchFavoritesAction = () => async (dispatch) => {
  try {
    dispatch(setFavoritesLoading(true));
    const data = await listFavoritesApi();
    dispatch(setFavorites(data));
  } catch (error) {
    console.error('Failed to load favorites list:', error);
  } finally {
    dispatch(setFavoritesLoading(false));
  }
};

export const starProjectAction = (project) => async (dispatch) => {
  try {
    const data = await addFavoriteApi(project._id);
    dispatch(addFavoriteToState({ ...data, project }));
    
    // Update active project details in projects list state
    dispatch(updateProjectInState({ ...project, isFavorite: true }));
    toast.success('Starred project.');
  } catch (error) {
    toast.error(error?.message || 'Failed to star project');
  }
};

export const unstarProjectAction = (project) => async (dispatch) => {
  try {
    await removeFavoriteApi(project._id);
    dispatch(removeFavoriteFromState(project._id));
    
    // Update active project details in projects list state
    dispatch(updateProjectInState({ ...project, isFavorite: false }));
    toast.success('Unstarred project.');
  } catch (error) {
    toast.error(error?.message || 'Failed to unstar project');
  }
};
