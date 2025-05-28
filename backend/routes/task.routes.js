import { Router } from 'express';
import { submitTask, getMyTasks } from '../controllers/task.controller.js';
import { authenticateFirebase } from '../middleware/firebaseAuth.middleware.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/submit', authenticateFirebase, upload.array('files'), submitTask);
router.get('/my-tasks/:email', authenticateFirebase, getMyTasks);

export default router;