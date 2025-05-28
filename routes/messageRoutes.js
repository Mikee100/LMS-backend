const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateTutor = require('../Middleware/auth');

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
    res.status(201).json({ message: 'Group message sent', data: message });
  } catch (err) {
    console.error('Send group error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
