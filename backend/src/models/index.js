import User from './User.js';
import Task from './Task.js';

// Define associations
Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });

export { User, Task }; 