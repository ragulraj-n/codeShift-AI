import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getFeed = asyncHandler(async (req, res) => {
  // Mock feed showing platform updates or public statistics
  const feedItems = [
    {
      id: '1',
      title: 'Welcome to CodeShift!',
      content: 'CodeShift lets you convert, optimize, debug and explain code across multiple languages instantly using state-of-the-art Hugging Face models.',
      date: new Date()
    },
    {
      id: '2',
      title: 'Hugging Face Qwen2.5-Coder Enabled',
      content: 'We are now utilizing the Qwen2.5-Coder model which scores exceptionally high on code understanding and language conversion benchmark tests.',
      date: new Date()
    }
  ];

  return res.status(200).json(new ApiResponse(200, feedItems, 'Feed retrieved successfully'));
});
