const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const { getAllUsers, getUserById, deleteUser } = require('../users/user.controller');

// Get all users (admin only)
router.get('/users', protect, authorize('admin'), getAllUsers);

// Get user by ID (admin only)
router.get('/users/:id', protect, authorize('admin'), getUserById);

// Delete user (admin only)
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
