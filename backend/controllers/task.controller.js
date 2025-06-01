import Task from '../models/task.model.js';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/user.model.js';
import Comment from '../models/comment.model.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const submitTask = async (request, reply) => {
  try {
    console.log('Submit Task Request:', { user: request.user });

    if (!request.user || !request.user.email) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    const userEmail = request.user.email;
    const parts = request.parts();
    let files = [];
    let body = {};

    for await (const part of parts) {
      if (part.file) {
        // Upload file to Cloudinary
        const buffer = await part.toBuffer();
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({
            resource_type: part.mimetype === 'application/pdf' ? 'raw' : 'auto',
            folder: 'task-uploads',
            access_mode: 'public',
            format: part.mimetype === 'application/pdf' ? 'pdf' : undefined,
            type: 'upload'
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }).end(buffer);
        });

        files.push({
          name: part.filename,
          url: result.secure_url,
          type: part.mimetype,
          size: result.bytes,
          public_id: result.public_id
        });
      } else {
        // Handle fields
        body[part.fieldname] = part.value;
      }
    }

    const task = await Task.create({
      userEmail,
      research: body.research,
      challenges: body.challenges,
      files: files.length > 0 ? JSON.stringify(files) : null,
      status: 'pending',
      submittedAt: new Date()
    });

    return reply.code(201).send({ 
      message: 'Task submitted successfully', 
      task: {
        ...task.toJSON(),
        files: files
      }
    });
  } catch (err) {
    console.error('Task Submission Error:', err);
    return reply.code(500).send({ message: 'Error submitting task', error: err.message });
  }
};

export const getMyTasks = async (request, reply) => {
  try {
    console.log('Fetching tasks for user:', request.user);

    if (!request.user || !request.user.email) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    const { email } = request.params;

    if (request.user.email.toLowerCase() !== email.toLowerCase()) {
      return reply.code(403).send({ message: 'Forbidden: You can only fetch your own tasks' });
    }

    const tasks = await Task.findAll({ 
      where: { userEmail: email },
      order: [['submittedAt', 'DESC']]
    });

    // Parse files JSON for each task
    const tasksWithFiles = tasks.map(task => ({
      ...task.toJSON(),
      files: task.files ? JSON.parse(task.files) : []
    }));

    return reply.send({ message: 'Tasks retrieved successfully', tasks: tasksWithFiles });
  } catch (err) {
    console.error('Task Retrieval Error:', err);
    return reply.code(500).send({ message: 'Error fetching tasks', error: err.message });
  }
};

export const getAllTasks = async (request, reply) => {
  try {
    console.log('Fetching all tasks');

    if (!request.user) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    // Check if user is admin
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Only admins can view all tasks' });
    }

    const tasks = await Task.findAll({
      order: [['submittedAt', 'DESC']]
    });

    // Parse files JSON for each task
    const tasksWithFiles = tasks.map(task => ({
      ...task.toJSON(),
      files: task.files ? JSON.parse(task.files) : []
    }));

    return reply.send({ message: 'All tasks retrieved successfully', tasks: tasksWithFiles });
  } catch (err) {
    console.error('All Tasks Retrieval Error:', err);
    return reply.code(500).send({ message: 'Error fetching all tasks', error: err.message });
  }
};

export const updateTaskStatus = async (request, reply) => {
  try {
    const { taskId } = request.params;
    const { status } = request.body;

    if (!request.user || !request.user.email) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return reply.code(404).send({ message: 'Task not found' });
    }

    // Only allow users to update their own tasks
    if (task.userEmail.toLowerCase() !== request.user.email.toLowerCase()) {
      return reply.code(403).send({ message: 'Forbidden: You can only update your own tasks' });
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'review'];
    if (!validStatuses.includes(status)) {
      return reply.code(400).send({ message: 'Invalid status' });
    }

    task.status = status;
    await task.save();

    return reply.send({ message: 'Task status updated successfully', task });
  } catch (err) {
    console.error('Task Status Update Error:', err);
    return reply.code(500).send({ message: 'Error updating task status', error: err.message });
  }
};

export const deleteTask = async (request, reply) => {
  try {
    const { taskId } = request.params;

    if (!request.user || !request.user.email) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return reply.code(404).send({ message: 'Task not found' });
    }

    // Only allow users to delete their own tasks
    if (task.userEmail.toLowerCase() !== request.user.email.toLowerCase()) {
      return reply.code(403).send({ message: 'Forbidden: You can only delete your own tasks' });
    }

    await task.destroy();
    return reply.send({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Task Deletion Error:', err);
    return reply.code(500).send({ message: 'Error deleting task', error: err.message });
  }
};

export const approveTask = async (request, reply) => {
  try {
    const { taskId } = request.params;

    if (!request.user || !request.user.email) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    // Check if user is admin
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Only admins can approve tasks' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return reply.code(404).send({ message: 'Task not found' });
    }

    task.status = 'completed';
    await task.save();

    return reply.send({ message: 'Task approved successfully', task });
  } catch (err) {
    console.error('Task Approval Error:', err);
    return reply.code(500).send({ message: 'Error approving task', error: err.message });
  }
};

export const rejectTask = async (request, reply) => {
  try {
    const { taskId } = request.params;

    if (!request.user || !request.user.email) {
      return reply.code(401).send({ message: 'Unauthorized: Missing user data' });
    }

    // Check if user is admin
    if (request.user.role !== 'admin') {
      return reply.code(403).send({ message: 'Forbidden: Only admins can reject tasks' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return reply.code(404).send({ message: 'Task not found' });
    }

    task.status = 'review';
    await task.save();

    return reply.send({ message: 'Task rejected successfully', task });
  } catch (err) {
    console.error('Task Rejection Error:', err);
    return reply.code(500).send({ message: 'Error rejecting task', error: err.message });
  }
};

export const getTaskStats = async (request, reply) => {
  try {
    const { role } = request.user;
    if (!['admin', 'supporter'].includes(role)) {
      return reply.code(403).send({ message: 'Unauthorized access' });
    }

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      reviewTasks,
      activeUsers,
      totalComments
    ] = await Promise.all([
      Task.count(),
      Task.count({ where: { status: 'completed' } }),
      Task.count({ where: { status: 'pending' } }),
      Task.count({ where: { status: 'review' } }),
      User.count({ where: { isActive: true } }),
      Comment.count()
    ]);

    const recentTasks = await Task.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Comment,
          attributes: ['id']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    return reply.send({
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        reviewTasks,
        activeUsers,
        totalComments
      },
      recentTasks
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return reply.code(500).send({ message: 'Failed to fetch task statistics' });
  }
};
