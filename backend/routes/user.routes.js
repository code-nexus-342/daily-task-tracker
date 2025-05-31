import { Router } from 'express';
import { register, login, getProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { isAdmin } from '../middleware/admin.middleware.js';
import {
  getAllUsers,
  promoteUser,
  deleteUser
} from '../controllers/user.controller.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getProfile);

// Admin routes
router.get('/', authenticate, isAdmin, getAllUsers);
router.post('/:userId/promote', authenticate, isAdmin, promoteUser);
router.post('/:userId/delete', authenticate, isAdmin, deleteUser);

export default router;