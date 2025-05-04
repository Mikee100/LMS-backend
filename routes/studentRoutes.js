// routes/studentRoutes.js
const express = require('express');
const router = express.Router();

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