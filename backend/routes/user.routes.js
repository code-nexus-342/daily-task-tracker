import { register, login, getProfile, getAllUsers, promoteUser, deleteUser } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';

export default async function (fastify, opts) {
  // Public routes
  fastify.post('/register', register);
  fastify.post('/login', login);

  // Protected routes
  fastify.get('/me', { preHandler: authenticate }, getProfile);

  // Admin routes
  fastify.get('/', { preHandler: [authenticate, isAdmin] }, getAllUsers);
  fastify.post('/:userId/promote', { preHandler: [authenticate, isAdmin] }, promoteUser);
  fastify.post('/:userId/delete', { preHandler: [authenticate, isAdmin] }, deleteUser);
}