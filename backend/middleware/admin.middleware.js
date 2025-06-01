import User from '../models/user.model.js';

export const isAdmin = async (request, reply) => {
  try {
    // Get user from request (set by auth middleware)
    const userId = request.user?.id;
    
    if (!userId) {
      return reply.code(401).send({ message: 'Authentication required' });
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    if (user.role !== 'admin') {
      return reply.code(403).send({ message: 'Access denied. Admin privileges required.' });
    }
  } catch (error) {
    console.error('Admin middleware error:', error);
    return reply.code(500).send({ message: 'Server error' });
  }
}; 