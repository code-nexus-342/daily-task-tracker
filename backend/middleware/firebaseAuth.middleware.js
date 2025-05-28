import admin from '../config/firebase.js';

export const authenticateFirebase = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // <-- Add this line
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error('Firebase token verification error:', err); // <-- Add this line
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};