import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  addComment,
  getTaskComments,
  updateComment,
  deleteComment
} from '../controllers/comment.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get comments for a task
router.get('/task/:taskId', getTaskComments);

// Add a comment to a task
router.post('/task/:taskId', addComment);

// Update a comment
router.put('/:commentId', updateComment);

// Delete a comment
router.delete('/:commentId', deleteComment);

export default router; 