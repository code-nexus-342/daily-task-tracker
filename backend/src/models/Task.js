import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './User.js';

class Task extends Model {}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id'
      }
    },
    research: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    files: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    challenges: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    submissionDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Task',
    timestamps: true
  }
);

// Define associations
Task.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Task, { foreignKey: 'userId' });

export default Task; 