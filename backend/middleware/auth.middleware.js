import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticate = async (request, reply) => {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return reply.code(401).send({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return reply.code(401).send({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return reply.code(401).send({ message: 'User not found' });
    }

    request.user = user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return reply.code(401).send({ message: 'Invalid token' });
  }
};

export const isAdmin = async (request, reply) => {
  if (request.user.role !== 'admin') {
    return reply.code(403).send({ message: 'Admin access required' });
  }
};