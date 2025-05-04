// In your backend route file (e.g., routes/tutorCourses.js)
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authenticateTutor = require('../Middleware/auth');

// Get courses for the authenticated tutor
router.get('/', authenticateTutor, async (req, res) => {
  try {
    const courses = await Course.find({ tutor: req.tutor._id })
      .select('title description thumbnail subject level createdAt')
      .sort({ createdAt: -1 });
    
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;