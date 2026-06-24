import Connection from '../models/Connection.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  const connection = await Connection.create({
    sender: senderId,
    receiver: receiverId,
    status: 'pending'
  });

  return res.status(201).json(new ApiResponse(201, connection, 'Connection request sent'));
});

export const acceptConnectionRequest = asyncHandler(async (req, res) => {
  const { connectionId } = req.params;

  const connection = await Connection.findByIdAndUpdate(
    connectionId,
    { status: 'accepted' },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, connection, 'Connection request accepted'));
});

export const listConnections = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const connections = await Connection.find({
    $or: [{ sender: userId }, { receiver: userId }],
    status: 'accepted'
  }).populate('sender receiver', 'name email');

  return res.status(200).json(new ApiResponse(200, connections, 'Connections retrieved'));
});
