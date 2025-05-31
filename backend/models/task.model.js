import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userEmail: { type: DataTypes.STRING, allowNull: false },
  research: { type: DataTypes.TEXT, allowNull: false },
  challenges: { type: DataTypes.TEXT, allowNull: true },
  files: { type: DataTypes.JSONB },
  status: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'completed', 'review']]
    }
  },
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
});

export default Task;
