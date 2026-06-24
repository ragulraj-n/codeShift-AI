import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import connectionReducer from '../features/connection/connectionSlice';
import editorReducer from '../features/editor/editorSlice';
import aiReducer from '../features/aiOperations/aiSlice';
import projectsReducer from '../features/projects/projectsSlice';
import foldersReducer from '../features/folders/foldersSlice';
import historyReducer from '../features/history/historySlice';
import favoritesReducer from '../features/favorites/favoritesSlice';
import sharingReducer from '../features/sharing/sharingSlice';

const appStore = configureStore({
  reducer: {
    user: authReducer,             // auth state
    connection: connectionReducer, // connections state
    editor: editorReducer,         // Monaco workspace state
    ai: aiReducer,                 // AI features state
    projects: projectsReducer,     // projects state
    folders: foldersReducer,       // folders state
    history: historyReducer,       // operation history state
    favorites: favoritesReducer,   // starred projects state
    sharing: sharingReducer        // shared previews state
  }
});

export default appStore;
export { appStore };
