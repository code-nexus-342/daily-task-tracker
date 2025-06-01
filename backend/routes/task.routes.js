import { submitTask, getMyTasks, getAllTasks, updateTaskStatus, deleteTask, approveTask, rejectTask, getTaskStats } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

export default async function (fastify, opts) {
  // Submit a new task
  fastify.post('/submit', {
    onRequest: [authenticate],
    handler: submitTask
  });

  // Get tasks for a specific user
  fastify.get('/my-tasks/:email', {
    onRequest: [authenticate],
    handler: getMyTasks
  });

  // Get all completed tasks
  fastify.get('/all', {
    onRequest: [authenticate],
    handler: getAllTasks
  });

  // Update task status
  fastify.patch('/:taskId/status', {
    onRequest: [authenticate],
    handler: updateTaskStatus
  });

  // Approve a task
  fastify.post('/:taskId/approve', {
    onRequest: [authenticate],
    handler: approveTask
  });

  // Reject a task
  fastify.post('/:taskId/reject', {
    onRequest: [authenticate],
    handler: rejectTask
  });

  // Delete a task
  fastify.delete('/:taskId', {
    onRequest: [authenticate],
    handler: deleteTask
  });

  // Get task statistics
  fastify.get('/stats', {
    onRequest: [authenticate],
    handler: getTaskStats
  });
}