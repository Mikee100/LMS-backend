// controllers/notificationController.js
const Notifications = require('../models/Notifications');

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id; 
    const notifications = await Notifications.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'name')       // populate tutor name
      .populate('course', 'title');     // optional: populate course name

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
