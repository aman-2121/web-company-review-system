const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const { register, login, logout, getCurrentUser, forgotPassword, verifyResetCode, resetPassword, changePassword, addAdmin } = require('./user.controller');

router.post('/register', register);
router.post('/login', passport.authenticate('local'), login);

// ✅ FIXED Google OAuth routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: process.env.CLIENT_URL + '/login?error=google_auth_failed',
    session: false 
  }),
  (req, res) => {
    try {
      // Create JWT token for Google auth
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });
      
      console.log('Google OAuth successful, redirecting to:', process.env.CLIENT_URL);
      res.redirect(process.env.CLIENT_URL);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(process.env.CLIENT_URL + '/login?error=auth_failed');
    }
  }
);

router.get('/me', protect, getCurrentUser);
router.post('/logout', logout);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// Change password route (requires authentication)
router.post('/change-password', protect, changePassword);

// Admin routes
router.post('/admin/add-admin', protect, authorize('admin'), addAdmin);

// Auth check route
router.get('/auth-check', (req, res) => {
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
});

module.exports = router;
