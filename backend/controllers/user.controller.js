import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (request, reply) => {
  try {
    console.log('Registration request body:', request.body);
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password });
      return reply.code(400).send({ message: 'Email and password are required' });
    }

    // Check if user exists
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      console.log('Email already registered:', email);
      return reply.code(400).send({ message: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      password: hash
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user data (excluding password)
    return reply.code(201).send({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return reply.code(500).send({ message: 'Registration failed', error: error.message });
  }
};

export const login = async (request, reply) => {
  try {
    const { email, password } = request.body;

    // Validate input
    if (!email || !password) {
      return reply.code(400).send({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return reply.code(401).send({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return user data (excluding password)
    return reply.send({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return reply.code(500).send({ message: 'Login failed', error: error.message });
  }
};

export const getProfile = async (request, reply) => {
  try {
    const user = await User.findByPk(request.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }

    return reply.send({ user });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return reply.code(500).send({ message: 'Failed to get profile', error: error.message });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile
    user.name = name;
    user.profileComplete = true;
    await user.save();

    res.json({
      message: 'Profile completed successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileComplete: user.profileComplete
      }
    });
  } catch (error) {
    console.error('Profile Completion Error:', error);
    res.status(500).json({ message: 'Profile completion failed', error: error.message });
  }
};

// Admin functions
export const getAllUsers = async (request, reply) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    return reply.send({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    return reply.code(500).send({ message: 'Failed to fetch users' });
  }
};

export const promoteUser = async (request, reply) => {
  try {
    const user = await User.findByPk(request.params.userId);
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return reply.code(400).send({ message: 'User is already an admin' });
    }
    
    user.role = 'admin';
    await user.save();
    
    return reply.send({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Promote user error:', error);
    return reply.code(500).send({ message: 'Failed to promote user' });
  }
};

export const deleteUser = async (request, reply) => {
  try {
    const user = await User.findByPk(request.params.userId);
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      return reply.code(403).send({ message: 'Cannot delete admin users' });
    }
    
    await user.destroy();
    
    return reply.send({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return reply.code(500).send({ message: 'Failed to delete user' });
  }
};

export const promoteToSupporter = async (request, reply) => {
  try {
    const user = await User.findByPk(request.params.userId);
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    
    if (user.role === 'supporter') {
      return reply.code(400).send({ message: 'User is already a supporter' });
    }
    
    if (user.role === 'admin') {
      return reply.code(400).send({ message: 'Cannot change admin role' });
    }
    
    user.role = 'supporter';
    await user.save();
    
    return reply.send({ message: 'User promoted to supporter successfully' });
  } catch (error) {
    console.error('Promote to supporter error:', error);
    return reply.code(500).send({ message: 'Failed to promote user to supporter' });
  }
};

export const demoteFromSupporter = async (request, reply) => {
  try {
    const user = await User.findByPk(request.params.userId);
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' });
    }
    
    if (user.role !== 'supporter') {
      return reply.code(400).send({ message: 'User is not a supporter' });
    }
    
    user.role = 'user';
    await user.save();
    
    return reply.send({ message: 'User demoted to regular user successfully' });
  } catch (error) {
    console.error('Demote from supporter error:', error);
    return reply.code(500).send({ message: 'Failed to demote user' });
  }
};
