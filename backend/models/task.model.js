import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userEmail: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  files: { type: DataTypes.JSONB }, // Changed to JSONB
  submittedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }, // Ensured not nullable
});

export default Task;
