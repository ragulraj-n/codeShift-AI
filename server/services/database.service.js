import Folder from '../models/Folder.js';
import Project from '../models/Project.js';

/**
 * Builds a nested folder and project tree for a specific user.
 * Useful for the dashboard/sidebar tree view.
 * @param {string} userId - User id to fetch workspace for.
 * @returns {Array} Nested workspace hierarchy.
 */
export const getWorkspaceTree = async (userId) => {
  // Fetch active folders and projects
  const folders = await Folder.find({ owner: userId, isDeleted: false }).lean();
  const projects = await Project.find({ owner: userId, isDeleted: false }).lean();

  // Map elements for easy lookup
  const folderMap = {};
  folders.forEach((f) => {
    folderMap[f._id.toString()] = {
      ...f,
      id: f._id.toString(),
      type: 'folder',
      children: []
    };
  });

  const rootItems = [];

  // Populate folder hierarchy
  folders.forEach((f) => {
    const folderObj = folderMap[f._id.toString()];
    if (f.parentFolder) {
      const parentId = f.parentFolder.toString();
      if (folderMap[parentId]) {
        folderMap[parentId].children.push(folderObj);
      } else {
        rootItems.push(folderObj); // Orphan or root
      }
    } else {
      rootItems.push(folderObj);
    }
  });

  // Distribute projects into folders or root
  projects.forEach((p) => {
    const projectObj = {
      ...p,
      id: p._id.toString(),
      type: 'project'
    };

    if (p.folder) {
      const folderId = p.folder.toString();
      if (folderMap[folderId]) {
        folderMap[folderId].children.push(projectObj);
      } else {
        rootItems.push(projectObj); // Fallback to root if folder not found
      }
    } else {
      rootItems.push(projectObj);
    }
  });

  return rootItems;
};

export default {
  getWorkspaceTree
};
