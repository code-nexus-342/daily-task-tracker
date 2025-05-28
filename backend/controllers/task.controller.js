import Task from '../models/task.model.js';

export const submitTask = async (req, res) => {
  try {
    console.log('Submit Task Request:', { user: req.user, body: req.body, files: req.files });

    // Accept either description or build from research/challenges
    let description = req.body.description;
    if (!description && req.body.research && req.body.challenges) {
      description = `Research: ${req.body.research}\nChallenges: ${req.body.challenges}`;
    }

    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: Missing user data' });
    }

    const userEmail = req.user.email;
    const files = req.files?.map(file => ({
      originalname: file.originalname,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const task = await Task.create({
      userEmail,
      description,
      files: JSON.stringify(files),
    });

    res.status(201).json({ message: 'Task submitted successfully', task });
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

    const tasks = await Task.findAll({ where: { userEmail: email } });

    res.json({ message: 'Tasks retrieved successfully', tasks });
  } catch (err) {
    console.error('Task Retrieval Error:', err);
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};
