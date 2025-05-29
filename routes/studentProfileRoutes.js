const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const authenticateToken = require('../Middleware/authMiddleware');

// Get current student's profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Adjust according to how you store the user in the token
    const studentId = req.student?._id || req.user?.id || req.user?.userId;
    if (!studentId) return res.status(401).json({ message: 'Unauthorized' });

    const student = await Student.findById(studentId).select('-password');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;