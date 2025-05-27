import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/auth.js';
import {
  completeProfile,
  getProfile,
  checkAuthStatus
} from '../controllers/userController.js';
import db from '../models/index.js';

const { User } = db;

const router = express.Router();

// Complete profile route
router.post(
  '/complete-profile',
  authenticate,
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  validateRequest,
  completeProfile
);

// Get user profile
router.get('/me', authenticate, getProfile);

// Check auth status
router.get('/auth/status', authenticate, checkAuthStatus);

export default router; 