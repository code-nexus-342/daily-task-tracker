import User from './user.model.js';
import Task from './task.model.js';
import Comment from './comment.model.js';

// User associations
User.hasMany(Task, { foreignKey: 'userEmail', sourceKey: 'email' });
User.hasMany(Comment, { foreignKey: 'userEmail', sourceKey: 'email' });

// Task associations
Task.belongsTo(User, { foreignKey: 'userEmail', targetKey: 'email' });
Task.hasMany(Comment, { foreignKey: 'taskId' });

// Comment associations
Comment.belongsTo(Task, { foreignKey: 'taskId' });
Comment.belongsTo(User, { foreignKey: 'userEmail', targetKey: 'email' });

export { User, Task, Comment }; 