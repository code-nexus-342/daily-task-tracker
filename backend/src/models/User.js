import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import jwt from 'jsonwebtoken';

class User extends Model {
  generateAuthToken() {
    return jwt.sign(
      {
        id: this.id,
        role: this.role,
        profileCompleted: this.profileCompleted
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    role: {
      type: DataTypes.ENUM('core', 'funder', 'guest'),
      defaultValue: 'guest'
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true
    },
    profileCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true
  }
);

export default User; 