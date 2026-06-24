import Folder from '../models/Folder.js';
import Project from '../models/Project.js';
import Favorite from '../models/Favorite.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createFolder = asyncHandler(async (req, res) => {
  const { name, parentFolderId } = req.body;
  const owner = req.user._id;

  if (!name) {
    throw new ApiError(400, 'Folder name is required.');
  }

  // Validate parent folder if provided
  if (parentFolderId) {
    const parentFolder = await Folder.findOne({ _id: parentFolderId, owner, isDeleted: false });
    if (!parentFolder) {
      throw new ApiError(404, 'Parent folder not found or unauthorized.');
    }
  }

  // Check duplicate folder in same level
  const existingFolder = await Folder.findOne({
    name,
    owner,
    parentFolder: parentFolderId || null,
    isDeleted: false
  });

  if (existingFolder) {
    throw new ApiError(400, 'A folder with this name already exists in this directory.');
  }

  const folder = await Folder.create({
    name,
    owner,
    parentFolder: parentFolderId || null
  });

  return res.status(201).json(new ApiResponse(201, folder, 'Folder created successfully'));
});

export const renameFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const { name } = req.body;
  const owner = req.user._id;

  if (!name) {
    throw new ApiError(400, 'Folder name is required.');
  }

  const folder = await Folder.findOne({ _id: folderId, owner, isDeleted: false });
  if (!folder) {
    throw new ApiError(404, 'Folder not found or unauthorized.');
  }

  // Check duplicates
  const existingFolder = await Folder.findOne({
    name,
    owner,
    parentFolder: folder.parentFolder,
    isDeleted: false,
    _id: { $ne: folderId }
  });

  if (existingFolder) {
    throw new ApiError(400, 'A folder with this name already exists in this directory.');
  }

  folder.name = name;
  await folder.save();

  return res.status(200).json(new ApiResponse(200, folder, 'Folder renamed successfully'));
});

// Helper to recursively soft delete subfolders and projects
const recursiveSoftDelete = async (folderId, owner) => {
  // 1. Soft delete projects directly inside this folder
  const projects = await Project.find({ folder: folderId, owner, isDeleted: false });
  const projectIds = projects.map(p => p._id);
  
  if (projectIds.length > 0) {
    await Project.updateMany({ _id: { $in: projectIds } }, { isDeleted: true });
    await Favorite.deleteMany({ project: { $in: projectIds } });
  }

  // 2. Find subfolders
  const subfolders = await Folder.find({ parentFolder: folderId, owner, isDeleted: false });
  for (const sub of subfolders) {
    sub.isDeleted = true;
    await sub.save();
    // Recurse into subfolder
    await recursiveSoftDelete(sub._id, owner);
  }
};

export const deleteFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const owner = req.user._id;

  const folder = await Folder.findOne({ _id: folderId, owner, isDeleted: false });
  if (!folder) {
    throw new ApiError(404, 'Folder not found or unauthorized.');
  }

  // Soft delete main folder
  folder.isDeleted = true;
  await folder.save();

  // Recursively soft delete children
  await recursiveSoftDelete(folderId, owner);

  return res.status(200).json(new ApiResponse(200, {}, 'Folder and all its contents deleted recursively'));
});

export const listFolders = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const folders = await Folder.find({ owner, isDeleted: false }).sort({ name: 1 });
  return res.status(200).json(new ApiResponse(200, folders, 'Folders retrieved successfully'));
});
