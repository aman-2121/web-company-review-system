// server/src/users/user.routes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect } = require('../middleware/auth.middleware');

const { register, login, logout, getCurrentUser } = require('./user.controller');

router.post('/register', register);
router.post('/login', passport.authenticate('local'), login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL);
  }
);
router.get('/me', protect, getCurrentUser);
router.post('/logout', logout);

module.exports = router;