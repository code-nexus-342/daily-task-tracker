import express from 'express';
import { submitTask, getMyTasks, getAllTasks, updateTaskStatus, deleteTask } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Submit a new task
router.post('/submit', authenticate, upload.array('files'), submitTask);

// Get tasks for a specific user
router.get('/my-tasks/:email', authenticate, getMyTasks);

// Get all completed tasks
router.get('/all', authenticate, getAllTasks);

// Update task status
router.patch('/:taskId/status', authenticate, updateTaskStatus);

// Delete a task
router.delete('/:taskId', authenticate, deleteTask);

export default router;