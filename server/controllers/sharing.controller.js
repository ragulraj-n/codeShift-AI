import crypto from 'crypto';
import SharedProject from '../models/SharedProject.js';
import Project from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const generateShareLink = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user._id;

  if (!projectId) {
    throw new ApiError(400, 'Project ID is required.');
  }

  // Ensure project exists and belongs to the user
  const project = await Project.findOne({ _id: projectId, owner: userId, isDeleted: false });
  if (!project) {
    throw new ApiError(404, 'Project not found or unauthorized.');
  }

  // Check if a share link already exists
  let shared = await SharedProject.findOne({ project: projectId, isDeleted: false });
  
  if (!shared) {
    const shareToken = crypto.randomBytes(16).toString('hex');
    shared = await SharedProject.create({
      project: projectId,
      shareToken
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { shareToken: shared.shareToken, url: `/shared/${shared.shareToken}` },
      'Share link generated successfully'
    )
  );
});

export const getSharedProject = asyncHandler(async (req, res) => {
  const { shareToken } = req.params;

  const shared = await SharedProject.findOne({ shareToken, isDeleted: false })
    .populate({
      path: 'project',
      match: { isDeleted: false }
    });

  if (!shared || !shared.project) {
    throw new ApiError(404, 'Shared project not found or expired.');
  }

  // Increment view count
  shared.viewCount += 1;
  await shared.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projectName: shared.project.name,
        description: shared.project.description,
        sourceCode: shared.project.sourceCode,
        outputCode: shared.project.outputCode,
        sourceLang: shared.project.sourceLang,
        targetLang: shared.project.targetLang,
        projectId: shared.project._id,
        createdAt: shared.project.createdAt,
        ownerName: 'CodeShift User' // Optionally populate owner name if needed
      },
      'Shared project fetched successfully'
    )
  );
});

export const forkProject = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  const userId = req.user._id;

  if (!projectId) {
    throw new ApiError(400, 'Project ID is required to fork.');
  }

  // Fetch the source project
  const sourceProject = await Project.findOne({ _id: projectId, isDeleted: false });
  if (!sourceProject) {
    throw new ApiError(404, 'Source project not found.');
  }

  // Create a duplicate for the current user
  const forkedProject = await Project.create({
    name: `Fork of ${sourceProject.name}`,
    description: sourceProject.description || `Forked from original project`,
    sourceCode: sourceProject.sourceCode,
    outputCode: sourceProject.outputCode,
    sourceLang: sourceProject.sourceLang,
    targetLang: sourceProject.targetLang,
    owner: userId,
    folder: null // Place in root level of user workspace
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      forkedProject,
      'Project forked successfully'
    )
  );
});
