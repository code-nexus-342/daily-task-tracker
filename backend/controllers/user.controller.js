import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });
    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(400).json({ message: 'Registration failed', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const name = req.body.name || req.body.fullName;
    const email = req.user.email;

    let user = await User.findOne({ where: { email } });

    // If user does not exist, create them
    if (!user) {
      user = await User.create({
        email,
        name,
        role: req.body.role || 'guest',
        profileComplete: true,
      });
      return res.json({ message: 'Profile created', user });
    }

    // If user exists, update profile
    user.name = name;
    user.profileComplete = true;
    await user.save();

    res.json({ message: 'Profile completed', user });
  } catch (err) {
    console.error('Profile Completion Error:', err);
    res.status(500).json({ message: 'Profile completion failed', error: err.message });
  }
};
