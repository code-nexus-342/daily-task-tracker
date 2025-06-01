import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  role: { 
    type: DataTypes.ENUM('user', 'admin'), 
    defaultValue: 'user' 
  },
  createdAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  },
  updatedAt: { 
    type: DataTypes.DATE, 
    defaultValue: DataTypes.NOW 
  }
});

export default User;