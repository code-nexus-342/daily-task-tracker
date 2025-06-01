import { addComment, getTaskComments, deleteComment } from '../controllers/comment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

export default async function (fastify, opts) {
  // Add a comment to a task
  fastify.post('/:taskId', {
    onRequest: [authenticate],
    handler: addComment
  });

  // Get all comments for a task
  fastify.get('/:taskId', {
    onRequest: [authenticate],
    handler: getTaskComments
  });

  // Delete a comment
  fastify.delete('/:commentId', {
    onRequest: [authenticate],
    handler: deleteComment
  });
} 