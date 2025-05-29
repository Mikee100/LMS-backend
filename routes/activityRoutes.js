const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const authenticateToken = require('../Middleware/authMiddleware');

router.get('/recent', authenticateToken, async (req, res) => {
  const studentId = req.user.userId || req.user.id;
  const activities = await Activity.find({ student: studentId })
    .sort({ timestamp: -1 })
    .limit(20)
    .populate('course lecture material assignment');
  res.json(activities);
});

module.exports = router;