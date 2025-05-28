// routes/schedule.js
const express = require('express');
const router = express.Router();
const ScheduledClass = require('../models/ScheduledClass');
const Enrollment = require('../models/Enrollment');
const authenticateTutor = require('../Middleware/auth');
const authenticateToken = require('../Middleware/authMiddleware');

// @route POST /api/schedule
// @desc Schedule a new class
router.post('/', authenticateTutor, async (req, res) => {
  try {
    const { courseId, title, description, start, end } = req.body;

    const newClass = new ScheduledClass({
      tutor: req.tutor._id,
      course: courseId,
      title,
      description,
      start,
      end
    });

    await newClass.save();
    res.status(201).json({ message: 'Class scheduled successfully', class: newClass });
  } catch (err) {
    console.error('Error scheduling class:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/schedule
// @desc Get all classes scheduled by the tutor
router.get('/', authenticateTutor, async (req, res) => {
  try {
    const classes = await ScheduledClass.find({ tutor: req.tutor._id }).populate('course', 'title');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route GET /api/schedule/student
// @desc Get all classes for courses the student is enrolled in

router.get('/student', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching classes for student:', req.user.userId);
    
    const enrollments = await Enrollment.find({ student: req.user.userId });

    if (!enrollments || enrollments.length === 0) {
      return res.status(404).json({ message: 'No enrollments found for this student.' });
    }

    const courseIds = enrollments.map(e => e.course);

    const classes = await ScheduledClass.find({ 
      course: { $in: courseIds } 
    })
    .populate('course', 'title')
    .populate('tutor', 'firstName lastName');
    
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



module.exports = router;
