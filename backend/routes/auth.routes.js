import { Router } from 'express';
import { authenticateFirebase } from '../middleware/firebaseAuth.middleware.js';

const router = Router();

router.post('/verify-token', authenticateFirebase, (req, res) => {
  // If token is valid, req.user will be set by the middleware
  res.json({ valid: true, user: req.user });
});

export default router;