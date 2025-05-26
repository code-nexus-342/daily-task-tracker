import express from 'express';
import multer from 'multer';
import path from 'path';
import { Task, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Submit a new task
router.post('/submit', authenticate, authorize('core'), upload.array('files'), async (req, res) => {
  try {
    const { research, challenges } = req.body;
    const files = req.files ? req.files.map(file => file.path) : [];

    const task = await Task.create({
      userId: req.user.id,
      research,
      challenges,
      files,
      submissionDate: new Date()
    });

    res.status(201).json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    logger.error('Task submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit task'
    });
  }
});

// Get all tasks
router.get('/all', authenticate, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'email']
      }],
      order: [['submissionDate', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        tasks
      }
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tasks'
    });
  }
});

// Get user's tasks
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: {
        userId: req.user.id
      },
      order: [['submissionDate', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        tasks
      }
    });
  } catch (error) {
    logger.error('Get user tasks error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user tasks'
    });
  }
});

export default router; 