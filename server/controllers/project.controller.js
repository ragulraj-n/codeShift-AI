import Project from '../models/Project.js';
import Folder from '../models/Folder.js';
import Favorite from '../models/Favorite.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, sourceCode, outputCode, sourceLang, targetLang, folderId } = req.body;
  const owner = req.user._id;

  if (!name || !sourceLang) {
    throw new ApiError(400, 'Project name and source language are required.');
  }

  // Validate folder ownership if folderId is provided
  if (folderId) {
    const folder = await Folder.findOne({ _id: folderId, owner, isDeleted: false });
    if (!folder) {
      throw new ApiError(404, 'Folder not found or unauthorized.');
    }
  }

  const project = await Project.create({
    name,
    description: description || '',
    sourceCode: sourceCode || '',
    outputCode: outputCode || '',
    sourceLang,
    targetLang: targetLang || '',
    owner,
    folder: folderId || null
  });

  return res.status(201).json(new ApiResponse(201, project, 'Project created successfully'));
});

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description, sourceCode, outputCode, sourceLang, targetLang, folderId } = req.body;
  const owner = req.user._id;

  const project = await Project.findOne({ _id: projectId, owner, isDeleted: false });
  if (!project) {
    throw new ApiError(404, 'Project not found or unauthorized.');
  }

  // Validate folder if updating
  if (folderId !== undefined) {
    if (folderId === null || folderId === '') {
      project.folder = null;
    } else {
      const folder = await Folder.findOne({ _id: folderId, owner, isDeleted: false });
      if (!folder) {
        throw new ApiError(404, 'Folder not found or unauthorized.');
      }
      project.folder = folderId;
    }
  }

  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (sourceCode !== undefined) project.sourceCode = sourceCode;
  if (outputCode !== undefined) project.outputCode = outputCode;
  if (sourceLang) project.sourceLang = sourceLang;
  if (targetLang !== undefined) project.targetLang = targetLang;

  await project.save();

  return res.status(200).json(new ApiResponse(200, project, 'Project updated successfully'));
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const owner = req.user._id;

  const project = await Project.findOne({ _id: projectId, owner, isDeleted: false });
  if (!project) {
    throw new ApiError(404, 'Project not found or unauthorized.');
  }

  // Soft delete
  project.isDeleted = true;
  await project.save();

  // Also clean up favorites relationship
  await Favorite.deleteMany({ project: projectId });

  return res.status(200).json(new ApiResponse(200, {}, 'Project deleted successfully'));
});

export const getProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const owner = req.user._id;

  const project = await Project.findOne({ _id: projectId, owner, isDeleted: false }).lean();
  if (!project) {
    throw new ApiError(404, 'Project not found or unauthorized.');
  }

  // Check if it is a favorite
  const isFavorite = await Favorite.exists({ user: owner, project: projectId });
  project.isFavorite = !!isFavorite;

  return res.status(200).json(new ApiResponse(200, project, 'Project retrieved successfully'));
});

export const listProjects = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { search, folderId } = req.query;

  const query = { owner, isDeleted: false };

  if (folderId) {
    query.folder = folderId === 'root' ? null : folderId;
  }

  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const projects = await Project.find(query).sort({ updatedAt: -1 }).lean();

  // Attach favorite status
  const favoriteProjects = await Favorite.find({ user: owner }).select('project').lean();
  const favoriteIds = new Set(favoriteProjects.map((f) => f.project.toString()));

  const projectsWithFav = projects.map((p) => ({
    ...p,
    isFavorite: favoriteIds.has(p._id.toString())
  }));

  return res.status(200).json(new ApiResponse(200, projectsWithFav, 'Projects list retrieved'));
});
