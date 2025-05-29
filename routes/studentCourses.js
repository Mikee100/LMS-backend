// routes/studentCourses.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const authenticateToken = require('../Middleware/authMiddleware'); // Ensure this middleware is correctly implemented








// Get enrolled courses
router.get('/enrolled', authenticateToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.student._id })
      .populate({
        path: 'course',
        select: 'title description thumbnail subject level'
      });
    
    const courses = enrollments.map(enrollment => ({
      ...enrollment.course.toObject(),
      progress: enrollment.progress,
      completed: enrollment.completed,
      lastAccessed: enrollment.updatedAt
    }));
    
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Get available courses (not enrolled)
router.get('/available', authenticateToken, async (req, res) => {
  try {
    // Get IDs of already enrolled courses
    const enrollments = await Enrollment.find({ student: req.student._id });
    const enrolledCourseIds = enrollments.map(e => e.course);
    
    // Find courses not in the enrolled list
    const courses = await Course.find({
      _id: { $nin: enrolledCourseIds }
    }).select('title description thumbnail subject level');
    
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enroll in a course
router.post('/:courseId/enroll', authenticateToken, async (req, res) => {
  try {
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.student._id,
      course: req.params.courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }
    
    // Create new enrollment
    const enrollment = new Enrollment({
      student: req.student._id,
      course: req.params.courseId,
      progress: 0,
      completed: false
    });
    
    await enrollment.save();
    res.json({ message: 'Successfully enrolled in course' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;