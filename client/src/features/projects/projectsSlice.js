import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  projects: [],
  activeProject: null,
  loading: false,
  error: null
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.projects = action.payload;
      state.error = null;
    },
    setActiveProject: (state, action) => {
      state.activeProject = action.payload;
    },
    addProjectToState: (state, action) => {
      state.projects.unshift(action.payload);
    },
    updateProjectInState: (state, action) => {
      const index = state.projects.findIndex((p) => p._id === action.payload._id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.activeProject?._id === action.payload._id) {
        state.activeProject = action.payload;
      }
    },
    removeProjectFromState: (state, action) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
      if (state.activeProject?._id === action.payload) {
        state.activeProject = null;
      }
    },
    setProjectsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setProjectsError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setProjects,
  setActiveProject,
  addProjectToState,
  updateProjectInState,
  removeProjectFromState,
  setProjectsLoading,
  setProjectsError
} = projectsSlice.actions;

export default projectsSlice.reducer;
