const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('./notification.controller');
const { protect } = require('../middleware/auth.middleware');

// Get all notifications for the authenticated user
router.get('/', protect, getNotifications);

// Mark a single notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all notifications as read
router.put('/read-all', protect, markAllAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;

