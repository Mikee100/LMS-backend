const express = require('express');
const jwt = require('jsonwebtoken')
const router = express.Router();
const Tutor = require('../models/Tutor');
const bcrypt = require('bcryptjs');
const { validateTutor } = require('../Middleware/validation');

const authenticateToken = require('../Middleware/authMiddleware');
const authenticateTutor = require('../Middleware/auth');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');

router.get("/dashboard", authenticateToken, async (req, res) => {

  try {

    const tutor = await Tutor.findOne({ email: req.user.email });
    
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    res.json(tutor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


const generateToken = (tutor) => {
  return jwt.sign(
    {
      id: tutor._id,
      email: tutor.email,
      role: 'tutor',
      status: tutor.status
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

router.post('/register', validateTutor, async (req, res) => {
  try {
    // 1. Check for existing tutor
    const existingTutor = await Tutor.findOne({ email: req.body.email });
    if (existingTutor) {
      return res.status(409).json({ 
        success: false,
        error: {
          field: 'email',
          message: 'Email already registered'
        }
      });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 3. Create new tutor
    const tutor = new Tutor({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      institution: req.body.institution,
      expertise: req.body.expertise,
      experience: req.body.experience,
      bio: req.body.bio,
      status: 'pending' // or 'active' if no approval needed
    });

    // 4. Save to database
    const savedTutor = await tutor.save();
    
    // 5. Generate JWT token
    const token = generateToken(savedTutor);

    // 6. Prepare response data (exclude sensitive fields)
    const tutorData = savedTutor.toObject();
    delete tutorData.password;
    delete tutorData.__v;

    // 7. Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful - pending approval',
      data: {
        tutor: tutorData,
        token,
        redirectTo: '/tutor/dashboard'
      }
    });

    // 8. Send welcome email (async - don't await)
    // sendWelcomeEmail(tutor.email, tutor.firstName);

  } catch (err) {
    console.error('Registration error:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        error: {
          type: 'validation',
          messages: errors
        }
      });
    }

    // Handle duplicate key errors
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'Email already registered',
          field: 'email'
        }
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }
    });
  }
});
// Get tutor by ID
router.get('/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id).select('-password');
    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }
    res.json(tutor);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route to get all tutors (pending/approved)
router.get('/', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const tutors = await Tutor.find(query).select('-password');
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route to approve/reject tutor
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    res.json({ 
      message: `Tutor ${status} successfully`,
      tutor 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/all/students', authenticateTutor, async (req, res) => {
  try {
    // Find all enrollments for this tutor
    const enrollments = await Enrollment.find({ tutor: req.tutor.id, paymentStatus: 'paid' })
      .populate({
        path: 'student',
        select: 'firstName lastName email interests studentId enrolledCourses'
      })
      .populate({
        path: 'course',
        select: 'title price'
      });

    // Map to unique students with their enrolled courses and payment info for this tutor
    const studentsMap = new Map();
    enrollments.forEach(enrollment => {
      if (enrollment.student) {
        const studentId = enrollment.student._id.toString();
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            ...enrollment.student.toObject(),
            courses: []
          });
        }
        if (enrollment.course) {
          studentsMap.get(studentId).courses.push({
            _id: enrollment.course._id,
            title: enrollment.course.title,
            price: enrollment.course.price,
            amountPaid: enrollment.amountPaid,
            paymentDate: enrollment.paymentDate
          });
        }
      }
    });

    const students = Array.from(studentsMap.values());

    res.json({ students });
  } catch (err) {
    console.error('Error in /api/tutors/all/students:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
