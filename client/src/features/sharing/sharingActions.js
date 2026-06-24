import { generateShareLinkApi, getSharedProjectApi, forkProjectApi } from './services/sharingApi';
import {
  setSharedProject,
  setShareUrl,
  setSharingLoading,
  setSharingError
} from './sharingSlice';
import { addProjectToState, setActiveProject } from '../projects/projectsSlice';
import toast from 'react-hot-toast';

export const generateShareLinkAction = (projectId) => async (dispatch) => {
  try {
    dispatch(setSharingLoading(true));
    const data = await generateShareLinkApi(projectId);
    
    // Construct full client URL
    const fullUrl = `${window.location.origin}${data.url}`;
    dispatch(setShareUrl(fullUrl));
    toast.success('Share link generated and copied!');
    return fullUrl;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to generate share link';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setSharingLoading(false));
  }
};

export const fetchSharedProjectAction = (shareToken) => async (dispatch) => {
  try {
    dispatch(setSharingLoading(true));
    const data = await getSharedProjectApi(shareToken);
    dispatch(setSharedProject(data));
    return data;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to fetch shared project';
    dispatch(setSharingError(errorMsg));
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setSharingLoading(false));
  }
};

export const forkProjectAction = (projectId) => async (dispatch) => {
  try {
    dispatch(setSharingLoading(true));
    const forked = await forkProjectApi(projectId);
    dispatch(addProjectToState(forked));
    dispatch(setActiveProject(forked));
    toast.success(`Successfully forked project: ${forked.name}`);
    return forked;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to fork project';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setSharingLoading(false));
  }
};
