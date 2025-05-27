import express from 'express';
import { auth } from '../config/firebase-admin.js';
import db from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const { User } = db;

const router = express.Router();

// Verify Firebase token and create/update user
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token is required'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Determine role based on name
    const userNamesAsUser = ['Larry', 'Oscar', 'Enock', 'Ryan', 'Peter'];
    const fullName = decodedToken.name || decodedToken.email.split('@')[0];
    let role = userNamesAsUser.includes(fullName) ? 'user' : 'admin';

    // Find or create user
    const [user, created] = await User.findOrCreate({
      where: { firebaseUid: decodedToken.uid },
      defaults: {
        email: decodedToken.email,
        fullName,
        role,
        profileCompleted: false
      }
    });

    // If user exists but profile is not completed, update with latest info
    if (!created && !user.profileCompleted) {
      await user.update({
        email: decodedToken.email,
        fullName: decodedToken.name || decodedToken.email.split('@')[0]
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profileCompleted: user.profileCompleted
        }
      }
    });
  } catch (error) {
    logger.error('Token verification error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { firebaseUid: req.user.uid }
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          profileCompleted: user.profileCompleted
        }
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
});

export default router; 