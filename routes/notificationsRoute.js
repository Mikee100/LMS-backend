// routes/notifications.js
const express = require('express');
const router = express.Router();
const Notifications = require('../models/Notifications');
const Enrollment = require('../models/Enrollment');
const authenticateTutor = require('../Middleware/auth');

// Get tutor's sent notifications
router.get('/sent', authenticateTutor, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      sender: req.tutor._id,
      type: 'tutor-message'
    })
    .populate('course', 'title')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send message to enrolled students
router.post('/tutor-message', authenticateTutor, async (req, res) => {
  try {
    const { courseId, message } = req.body;

    // Get enrolled students
    const enrollments = await Enrollment.find({ course: courseId });
    if (!enrollments.length) {
      return res.status(400).json({ message: 'No students enrolled in this course' });
    }

    // Create notifications
    const notifications = enrollments.map(enrollment => ({
      user: enrollment.student,
      sender: req.tutor._id,
      course: courseId,
      message,
      type: 'tutor-message'
    }));

    await Notifications.insertMany(notifications);

    res.json({ 
      message: `Notification sent to ${enrollments.length} students`,
      count: enrollments.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/notifications/send
router.post('/send', async (req, res) => {
  try {
    const { user, sender, course, scheduledClass, message, type } = req.body;

    if (!user || !message || !type) {
      return res.status(400).json({ error: 'user, message, and type are required' });
    }

    const notification = new Notifications({
      user,
      sender,
      course,
      scheduledClass,
      message,
      type,
    });

    await notification.save();

    res.status(201).json({ message: 'Notification created successfully', notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});



module.exports = router;