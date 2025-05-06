// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authenticateToken = require('../Middleware/authMiddleware'); // Ensure this middleware is correctly implemented

router.get('/courses', authenticateToken, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Fetch all courses
    const allCourses = await Course.find();

    // Fetch enrolled courses for this student
    const enrolledCourseIds = await Course.find({ students: studentId }).distinct('_id');

    // Add an 'enrolled' field to each course
    const coursesWithEnrollmentStatus = allCourses.map(course => {
      return {
        ...course.toObject(),
        enrolled: enrolledCourseIds.includes(course._id.toString())
      };
    });

    res.json(coursesWithEnrollmentStatus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// GET /api/students/courses/:id
// GET a specific course by ID
router.get('/courses/:id', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    console.log('Course ID:', courseId); // DEBUG

    // Validate MongoDB ObjectId
    if (!courseId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid course ID' });
    }

    const course = await Course.findById(courseId)
      .populate('tutor', 'name email') // Only if tutor is a referenced user
      .lean();

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// Import controllers and middleware - verify these paths are correct
const studentController = require('../controllers/studentController');
const validateStudent = require('../Middleware/validateStudent'); // lowercase 'm' in middleware

// Student registration route
router.post(
  '/register',
  validateStudent.register, // Make sure this is the correct exported function name
  studentController.registerStudent
);

// Add other routes...

module.exports = router;