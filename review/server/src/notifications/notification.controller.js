const { Notification, User } = require('../models');

/**
 * Get all notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a notification
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Internal helper: Create a notification for a specific user
 */
const createNotification = async ({ userId, type, title, message, relatedId, relatedType, companyId }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
      companyId,
    });
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

/**
 * Internal helper: Create notifications for all admins
 */
const createNotificationForAdmins = async ({ type, title, message, relatedId, relatedType }) => {
  try {
    const admins = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id'],
    });

    const notifications = await Promise.all(
      admins.map((admin) =>
        Notification.create({
          userId: admin.id,
          type,
          title,
          message,
          relatedId,
          relatedType,
        })
      )
    );

    return notifications;
  } catch (err) {
    console.error('Error creating admin notifications:', err);
    return null;
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createNotificationForAdmins,
};

