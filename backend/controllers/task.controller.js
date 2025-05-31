import Task from '../models/task.model.js';

export const submitTask = async (req, res) => {
  try {
    console.log('Submit Task Request:', { user: req.user, body: req.body, files: req.files });

    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }

    const userEmail = req.user.email;
    const files = req.files?.map(file => ({
      name: file.originalname,
      url: file.filename,
      type: file.mimetype,
      size: file.size,
    }));

    const task = await Task.create({
      userEmail,
      research: req.body.research,
      challenges: req.body.challenges,
      files: files ? JSON.stringify(files) : null,
      status: 'pending',
      submittedAt: new Date()
    });

    res.status(201).json({ 
      message: 'Task submitted successfully', 
      task: {
        ...task.toJSON(),
        files: files || []
      }
    });
  } catch (err) {
    console.error('Task Submission Error:', err);
    res.status(500).json({ message: 'Error submitting task', error: err.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    console.log('Fetching tasks for user:', req.user);

    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }

    const { email } = req.params;

    if (req.user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({ message: 'Forbidden: You can only fetch your own tasks' });
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

    res.json({ message: 'Tasks retrieved successfully', tasks: tasksWithFiles });
  } catch (err) {
    console.error('Task Retrieval Error:', err);
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

export const getAllTasks = async (req, res) => {
  try {
    console.log('Fetching all tasks');

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }

    const tasks = await Task.findAll({
      where: { status: 'completed' }, // Only show completed tasks to all users
      order: [['submittedAt', 'DESC']]
    });

    // Parse files JSON for each task
    const tasksWithFiles = tasks.map(task => ({
      ...task.toJSON(),
      files: task.files ? JSON.parse(task.files) : []
    }));

    res.json({ message: 'All tasks retrieved successfully', tasks: tasksWithFiles });
  } catch (err) {
    console.error('All Tasks Retrieval Error:', err);
    res.status(500).json({ message: 'Error fetching all tasks', error: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow users to update their own tasks
    if (task.userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own tasks' });
    }

    // Validate status
    const validStatuses = ['pending', 'completed', 'review'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    task.status = status;
    await task.save();

    res.json({ message: 'Task status updated successfully', task });
  } catch (err) {
    console.error('Task Status Update Error:', err);
    res.status(500).json({ message: 'Error updating task status', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only allow users to delete their own tasks
    if (task.userEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own tasks' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Task Deletion Error:', err);
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};
