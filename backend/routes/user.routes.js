import { register, login, getProfile, getAllUsers, promoteUser, deleteUser, promoteToSupporter, demoteFromSupporter } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

export default async function (fastify, opts) {
  // Public routes
  fastify.post('/register', register);
  
  // Login route with schema
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 }
        }
      }
    },
    handler: login
  });

  // Protected routes
  fastify.get('/me', {
    onRequest: [authenticate],
    handler: getProfile
  });

  // Admin routes
  fastify.get('/', {
    onRequest: [authenticate, isAdmin],
    handler: getAllUsers
  });

  fastify.post('/:userId/promote', {
    onRequest: [authenticate, isAdmin],
    handler: promoteUser
  });

  fastify.post('/:userId/promote-supporter', {
    onRequest: [authenticate, isAdmin],
    handler: promoteToSupporter
  });

  fastify.post('/:userId/demote', {
    onRequest: [authenticate, isAdmin],
    handler: demoteFromSupporter
  });

  fastify.post('/:userId/delete', {
    onRequest: [authenticate, isAdmin],
    handler: deleteUser
  });
}