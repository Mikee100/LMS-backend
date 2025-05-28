const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const authenticateToken = require('../Middleware/authMiddleware');

// Get progress for a course
router.get('/:courseId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { courseId } = req.params;
    const progress = await Progress.findOne({ student: studentId, course: courseId });
    res.json(progress || { completedLectures: [], completedMaterials: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a lecture as completed
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.userId || req.user.id;
    const { courseId, lectureId } = req.body;
    if (!courseId || !lectureId) {
      return res.status(400).json({ message: 'Missing courseId or lectureId' });
    }
    await Progress.findOneAndUpdate(
      { student: studentId, course: courseId },
      { $addToSet: { completedLectures: lectureId }, $set: { lastAccessed: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;