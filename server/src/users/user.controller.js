// server/src/users/user.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// ✅ Import from centralized models
const { User, Role } = require('../models');


/**
 * Register a new user (local strategy)
 */
// server/src/users/user.controller.js


exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user', // just a string
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('jwt', token, { httpOnly: true, secure: false });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
/**
 * Login user (local strategy) - handled by Passport, but we return JWT
 * This is called after Passport authenticates
 */
exports.login = async (req, res) => {
  try {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role, // Remove .name - it's already a string
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role, // Remove .name here too
    },
  });
};

/**
 * Logout: Clear JWT cookie
 */
exports.logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

/**
 * Google OAuth callback success handler
 * Called after Google login success
 */
exports.googleAuthCallback = (req, res) => {
  // You can redirect or send JSON depending on your flow
  // For SPA: redirect back to client
  res.redirect(process.env.CLIENT_URL);
};

/**
 * Check auth status (for auto-login on page refresh)
 */
exports.authCheck = async (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role.name,
      },
    });
  } else {
    res.json({ authenticated: false, user: null });
  }
};