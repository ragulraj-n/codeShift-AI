import { createProjectApi, updateProjectApi, deleteProjectApi, getProjectApi, listProjectsApi } from './services/projectsApi';
import {
  setProjects,
  setActiveProject,
  addProjectToState,
  updateProjectInState,
  removeProjectFromState,
  setProjectsLoading,
  setProjectsError
} from './projectsSlice';
import { setSourceCode, setOutputCode, setSourceLang, setTargetLang, setResultType, setReport } from '../editor/editorSlice';
import toast from 'react-hot-toast';

export const fetchProjectsAction = (params = {}) => async (dispatch) => {
  try {
    dispatch(setProjectsLoading(true));
    const data = await listProjectsApi(params);
    dispatch(setProjects(data));
  } catch (error) {
    const errorMsg = error?.message || 'Failed to fetch projects';
    dispatch(setProjectsError(errorMsg));
    toast.error(errorMsg);
  } finally {
    dispatch(setProjectsLoading(false));
  }
};

export const fetchProjectByIdAction = (projectId) => async (dispatch) => {
  try {
    dispatch(setProjectsLoading(true));
    const project = await getProjectApi(projectId);
    dispatch(setActiveProject(project));
    
    // Populate the editor workspace with project contents
    dispatch(setSourceCode(project.sourceCode || ''));
    dispatch(setSourceLang(project.sourceLang || 'javascript'));
    
    if (project.targetLang) {
      dispatch(setTargetLang(project.targetLang));
    }
    
    // Check if right editor had report markdown or normal code
    if (project.outputCode?.trim()?.startsWith('## ') || project.outputCode?.trim()?.startsWith('# ')) {
      dispatch(setReport(project.outputCode));
      dispatch(setResultType('markdown'));
    } else {
      dispatch(setOutputCode(project.outputCode || ''));
      dispatch(setResultType('code'));
    }
    
    return project;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to load project';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setProjectsLoading(false));
  }
};

export const createNewProjectAction = (projectData) => async (dispatch) => {
  try {
    dispatch(setProjectsLoading(true));
    const project = await createProjectApi(projectData);
    dispatch(addProjectToState(project));
    dispatch(setActiveProject(project));
    toast.success('Project saved successfully!');
    return project;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to save project';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setProjectsLoading(false));
  }
};

export const saveCurrentWorksheetAction = (projectId, codeData) => async (dispatch) => {
  try {
    const project = await updateProjectApi(projectId, codeData);
    dispatch(updateProjectInState(project));
    toast.success('Worksheet saved.');
    return project;
  } catch (error) {
    const errorMsg = error?.message || 'Failed to save worksheet changes';
    toast.error(errorMsg);
    throw error;
  }
};

export const deleteProjectAction = (projectId) => async (dispatch) => {
  try {
    dispatch(setProjectsLoading(true));
    await deleteProjectApi(projectId);
    dispatch(removeProjectFromState(projectId));
    toast.success('Project deleted.');
  } catch (error) {
    const errorMsg = error?.message || 'Failed to delete project';
    toast.error(errorMsg);
    throw error;
  } finally {
    dispatch(setProjectsLoading(false));
  }
};
