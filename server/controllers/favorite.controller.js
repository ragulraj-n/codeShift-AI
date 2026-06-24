import Favorite from '../models/Favorite.js';
import Project from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addFavorite = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user._id;

  if (!projectId) {
    throw new ApiError(400, 'Project ID is required.');
  }

  // Ensure project exists and belongs to user
  const project = await Project.findOne({ _id: projectId, owner: userId, isDeleted: false });
  if (!project) {
    throw new ApiError(404, 'Project not found or unauthorized.');
  }

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({ user: userId, project: projectId });
  if (existingFavorite) {
    return res.status(200).json(new ApiResponse(200, existingFavorite, 'Project is already in favorites'));
  }

  const favorite = await Favorite.create({
    user: userId,
    project: projectId
  });

  return res.status(201).json(new ApiResponse(201, favorite, 'Project added to favorites'));
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user._id;

  const result = await Favorite.findOneAndDelete({ user: userId, project: projectId });
  if (!result) {
    throw new ApiError(404, 'Favorite record not found.');
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Project removed from favorites'));
});

export const listFavorites = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find favorites and populate project details
  const favorites = await Favorite.find({ user: userId })
    .populate({
      path: 'project',
      match: { isDeleted: false }
    })
    .sort({ createdAt: -1 });

  // Filter out any populated favorites where the project was soft-deleted
  const validFavorites = favorites.filter((fav) => fav.project !== null);

  return res.status(200).json(new ApiResponse(200, validFavorites, 'Favorites retrieved successfully'));
});
