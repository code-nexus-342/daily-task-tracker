import { User } from '../models/index.js';
import { logger } from '../utils/logger.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user profile'
    });
  }
};

// Complete user profile
export const completeProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Update user profile
    await user.update({
      fullName,
      email,
      isProfileCompleted: true
    });

    // Generate new token with updated profile status
    const token = user.generateAuthToken();

    res.json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Profile completion error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to complete profile'
    });
  }
};

// Check authentication status
export const checkAuthStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user,
        isAuthenticated: true,
        isProfileCompleted: user.isProfileCompleted
      }
    });
  } catch (error) {
    logger.error('Auth status check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check authentication status'
    });
  }
}; 