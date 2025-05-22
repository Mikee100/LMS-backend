// routes/enrollment.js
const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Student = require('../models/Student');
const authenticateToken = require('../Middleware/authMiddleware');

// Enroll student in course
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentEmail = req.user.email;

    // Find student by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get course and its tutor
    const course = await Course.findById(courseId).populate('tutor');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      course: course._id,
    });

    if (existingEnrollment) {
      return res.status(200).json({ 
        message: 'Already enrolled in this course',
        enrolled: true,
        enrollment: existingEnrollment
      });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      student: student._id,
      course: course._id,
      tutor: course.tutor._id,
    });

    await enrollment.save();

    // Update course's enrolledStudents count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 }
    });

    res.status(201).json({
      message: 'Enrollment successful',
      enrolled: true,
      enrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
});

// Check enrollment status
router.get('/status/:id', authenticateToken, async (req, res) => {

  try {
    const courseId = req.params.id;

    console.log('Course ID:', courseId);
    const studentEmail = req.user.email;
    console.log('Student Email:', studentEmail);

    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const enrollment = await Enrollment.findOne({
      student: student._id,
      course: courseId
    });
    console.log('Enrollment:', enrollment);

    res.json({
      enrolled: !!enrollment,
      enrollment
    });

  } catch (error) {
    console.error('Enrollment status error:', error);
    res.status(500).json({ message: 'Server error checking enrollment' });
  }
});

module.exports = router;