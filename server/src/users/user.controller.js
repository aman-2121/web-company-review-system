const jwt = require('jsonwebtoken');
const EmailValidator = require('../utils/emailValidator');
const { User } = require('../models');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // ✅ STRONG EMAIL VALIDATION
    const emailValidation = await EmailValidator.validateEmailForRegistration(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ 
        success: false,
        message: emailValidation.message 
      });
    }

    // ✅ VALIDATE NAME
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Name is required' 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Name must be at least 2 characters long' 
      });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ 
        success: false,
        message: 'Name cannot exceed 50 characters' 
      });
    }

    // ✅ STRONG PASSWORD VALIDATION
    if (!password) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is required' 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 8 characters long' 
      });
    }

    if (password.length > 128) {
      return res.status(400).json({ 
        success: false,
        message: 'Password is too long' 
      });
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must contain at least one lowercase letter' 
      });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must contain at least one uppercase letter' 
      });
    }

    if (!/(?=.*\d)/.test(password)) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must contain at least one number' 
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role: 'user',
    });

    // Generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('jwt', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

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
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
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
      role: req.user.role,
    },
  });
};

exports.logout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logged out successfully' });
};

exports.googleAuthCallback = (req, res) => {
  res.redirect(process.env.CLIENT_URL);
};

exports.authCheck = async (req, res) => {
  if (req.user) {
    res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } else {
    res.json({ authenticated: false, user: null });
  }
};