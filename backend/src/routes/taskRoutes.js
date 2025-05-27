import express from 'express';
import multer from 'multer';
import path from 'path';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest.js';
import db from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const { Task, User } = db;

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

// Get all tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email']
        }
      ]
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
      message: 'Failed to get tasks'
    });
  }
});

// Create new task
router.post(
  '/',
  authenticate,
  [
    body('research').notEmpty().withMessage('Research is required'),
    body('files').optional().isArray(),
    body('challenges').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { research, files, challenges } = req.body;
      const userId = req.user.id;

      const task = await Task.create({
        userId,
        research,
        files: files || [],
        challenges
      });

      res.status(201).json({
        status: 'success',
        data: {
          task
        }
      });
    } catch (error) {
      logger.error('Create task error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create task'
      });
    }
  }
);

// Get task by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        task
      }
    });
  } catch (error) {
    logger.error('Get task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get task'
    });
  }
});

// Update task
router.put(
  '/:id',
  authenticate,
  [
    body('research').optional().notEmpty().withMessage('Research cannot be empty'),
    body('files').optional().isArray(),
    body('challenges').optional().isString()
  ],
  validateRequest,
  async (req, res) => {
    try {
      const task = await Task.findByPk(req.params.id);

      if (!task) {
        return res.status(404).json({
          status: 'error',
          message: 'Task not found'
        });
      }

      // Check if user is authorized to update this task
      if (task.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this task'
        });
      }

      await task.update(req.body);

      res.json({
        status: 'success',
        data: {
          task
        }
      });
    } catch (error) {
      logger.error('Update task error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update task'
      });
    }
  }
);

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }

    // Check if user is authorized to delete this task
    if (task.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this task'
      });
    }

    await task.destroy();

    res.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Delete task error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete task'
    });
  }
});

export default router; 