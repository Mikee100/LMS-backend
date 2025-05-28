const express = require('express');
const router = express.Router();
const Notifications = require('../models/Notifications');
const authenticateToken = require('../Middleware/authMiddleware');

// Get all notifications for the logged-in student
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notifications.find({ recipient: req.user.userId })
   
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await Notifications.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notifications.updateMany({ recipient: req.user.userId }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;