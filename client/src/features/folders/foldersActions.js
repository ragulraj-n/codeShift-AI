import { createFolderApi, renameFolderApi, deleteFolderApi, listFoldersApi } from './services/foldersApi';
import {
  setFolders,
  addFolderToState,
  updateFolderInState,
  removeFolderFromState,
  setFoldersLoading
} from './foldersSlice';
import { fetchProjectsAction } from '../projects/projectsActions';
import toast from 'react-hot-toast';

export const fetchFoldersAction = () => async (dispatch) => {
  try {
    dispatch(setFoldersLoading(true));
    const folders = await listFoldersApi();
    dispatch(setFolders(folders));
  } catch (error) {
    const errorMsg = error?.message || 'Failed to fetch folders';
    toast.error(errorMsg);
  } finally {
    dispatch(setFoldersLoading(false));
  }
};

export const createNewFolderAction = (name, parentFolderId) => async (dispatch) => {
  try {
    dispatch(setFoldersLoading(true));
    const folder = await createFolderApi(name, parentFolderId);
    dispatch(addFolderToState(folder));
    toast.success('Folder created successfully.');
    return folder;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to create folder';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setFoldersLoading(false));
  }
};

export const renameFolderAction = (folderId, name) => async (dispatch) => {
  try {
    dispatch(setFoldersLoading(true));
    const folder = await renameFolderApi(folderId, name);
    dispatch(updateFolderInState(folder));
    toast.success('Folder renamed successfully.');
    return folder;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to rename folder';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setFoldersLoading(false));
  }
};

export const deleteFolderAction = (folderId) => async (dispatch) => {
  try {
    dispatch(setFoldersLoading(true));
    await deleteFolderApi(folderId);
    dispatch(removeFolderFromState(folderId));
    
    // Deleting a folder recursively updates project list, so refresh projects
    dispatch(fetchProjectsAction());
    
    toast.success('Folder and all contents deleted.');
  } catch (error) {
    const errorMsg = error?.message || 'Failed to delete folder';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setFoldersLoading(false));
  }
};
