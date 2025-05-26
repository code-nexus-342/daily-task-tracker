import { auth } from '../config/firebase-admin.js';
import { logger } from '../utils/logger.js';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture
    };
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Get user from database to check role
      const user = await User.findOne({ where: { firebaseUid: req.user.uid } });
      
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
      
      // Add user role to request
      req.user.role = user.role;
      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Internal server error'
      });
    }
  };
}; 