import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'guest' }, // guest, core, funder
  name: { type: DataTypes.STRING },
  profileComplete: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export default User;