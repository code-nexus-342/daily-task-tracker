import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });

  logger.info('Firebase Admin SDK initialized successfully');
} catch (error) {
  logger.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

export const auth = admin.auth(); 