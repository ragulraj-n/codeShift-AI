import Project from '../models/Project.js';
import Folder from '../models/Folder.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const globalSearch = asyncHandler(async (req, res) => {
  const owner = req.user._id;
  const { query } = req.query;

  if (!query) {
    return res.status(200).json(new ApiResponse(200, { folders: [], projects: [] }, 'Empty search query'));
  }

  const searchRegex = { $regex: query, $options: 'i' };

  const folders = await Folder.find({
    owner,
    isDeleted: false,
    name: searchRegex
  }).limit(10).lean();

  const projects = await Project.find({
    owner,
    isDeleted: false,
    $or: [{ name: searchRegex }, { description: searchRegex }]
  }).limit(20).lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      { folders, projects },
      'Global workspace search completed'
    )
  );
});
