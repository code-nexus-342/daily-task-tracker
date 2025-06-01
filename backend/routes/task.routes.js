import { submitTask, getMyTasks, getAllTasks, updateTaskStatus, deleteTask } from '../controllers/task.controller.js';
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

  // Delete a task
  fastify.delete('/:taskId', {
    onRequest: [authenticate],
    handler: deleteTask
  });
}