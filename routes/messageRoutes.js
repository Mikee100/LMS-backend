const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateTutor = require('../Middleware/auth');

const Notifications = require('../models/Notifications'); // Make sure this is imported

const authenticateToken = require('../Middleware/authMiddleware');

// GET inbox messages
router.get('/inbox', authenticateTutor, async (req, res) => {
  try {
    const { type } = req.query;
    console.log('Fetching inbox messages for tutor:', req.tutor.id);
    console.log('Message type:', type);

    // Fetch messages SENT by this tutor
    const filter = { sender: req.tutor.id };
    if (type) {
      filter.type = type;
    }

    const messages = await Message.find(filter)
      .populate('recipients', 'firstName lastName email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// SEND Announcement
router.post('/send/announcement', authenticateTutor, async (req, res) => {
  try {
    const { content, recipients, course } = req.body;

    if (!content || !recipients || !course) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const message = new Message({
      sender: req.tutor.id,
      recipients,
      content,
      type: 'announcement',
      course
    });

    await message.save();

    // Create a notification for each recipient
    await Promise.all(
      recipients.map(studentId =>
        Notifications.create({
          recipient: studentId,
          sender: req.tutor.id,
          type: 'announcement',
          message: content
        })
      )
    );

    res.status(201).json({ message: 'Announcement sent', data: message });
  } catch (err) {
    console.error('Send announcement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SEND Direct Message
router.post('/send/direct', authenticateTutor, async (req, res) => {
  try {
    const { content, recipients } = req.body;

    if (!content || !recipients) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const message = new Message({
      sender: req.tutor.id,
      recipients,
      content,
      type: 'direct'
    });

    await message.save();

    // Create a notification for each recipient
    await Promise.all(
      recipients.map(studentId =>
        Notifications.create({
          recipient: studentId,
          sender: req.tutor.id,
          type: 'message',
          message: content
        })
      )
    );

    res.status(201).json({ message: 'Direct message sent', data: message });
  } catch (err) {
    console.error('Send direct error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// SEND Group Message
router.post('/send/group', authenticateTutor, async (req, res) => {
  try {
    const { content, recipients, course } = req.body;

    if (!content || !recipients || !course) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    const message = new Message({
      sender: req.tutor.id,
      recipients,
      content,
      type: 'group',
      course
    });

    await message.save();

    // Create a notification for each recipient
    await Promise.all(
      recipients.map(studentId =>
        Notifications.create({
          recipient: studentId,
          sender: req.tutor.id,
          type: 'group',
          message: content
        })
      )
    );

    res.status(201).json({ message: 'Group message sent', data: message });
  } catch (err) {
    console.error('Send group error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});






// Student sends direct message to a tutor
router.post('/student/send/direct', authenticateToken, async (req, res) => {
  try {
    const { content, tutorId } = req.body;

    if (!content || !tutorId) {
      return res.status(400).json({ message: 'Missing content or tutorId' });
    }
console.log('Sending direct message from student:', req.user.userId);
    console.log('To tutor:', tutorId);
    const message = new Message({
      sender: req.user.userId, // student id
      recipients: [tutorId],
      content,
      type: 'direct'
    });
    await message.save();

    console.log('Message saved:', message);
 
    
await Notifications.create({
  recipient: tutorId, // <-- use recipient here
  sender: req.user.userId,
  type: 'message',
  message: content
});
    console.log('Notification created for tutor:', tutorId);

    res.status(201).json({ message: 'Message sent to tutor', data: message });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/conversation/:tutorId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const tutorId = req.params.tutorId;

    // Find all direct messages between this student and this tutor
    const messages = await Message.find({
      type: 'direct',
      $or: [
        { sender: studentId, recipients: tutorId },
        { sender: tutorId, recipients: studentId }
      ]
    }).sort({ createdAt: 1 }); // oldest first

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all direct messages between tutor and a student
router.get('/conversation/:studentId', authenticateToken, async (req, res) => {
  try {
    const tutorId = req.user.id || req.user.userId;
    const studentId = req.params.studentId;

    const messages = await Message.find({
      type: 'direct',
      $or: [
        { sender: tutorId, recipients: studentId },
        { sender: studentId, recipients: tutorId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
