import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  taskId: { 
    type: DataTypes.INTEGER, 
    allowNull: false, 
    references: {
      model: 'Tasks',
      key: 'id'
    }
  },
  userEmail: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
  updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false }
});

export default Comment; 