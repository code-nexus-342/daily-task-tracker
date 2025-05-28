import { Router } from 'express';
import { register, login, completeProfile } from '../controllers/user.controller.js';
import { authenticateFirebase } from '../middleware/firebaseAuth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/profile', authenticateFirebase, completeProfile);

export default router;