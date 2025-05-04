const Student = require('../models/Student');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.registerStudent = catchAsync(async (req, res, next) => {
  // 1) Check if email or studentId already exists
  const existingStudent = await Student.findOne({
    $or: [
      { email: req.body.email },
      { studentId: req.body.studentId }
    ]
  });

  if (existingStudent) {
    return next(new AppError('Email or Student ID already in use', 400));
  }

  // 2) Create new student
  const newStudent = await Student.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    dateOfBirth: req.body.dateOfBirth,
    studentId: req.body.studentId,
    interests: req.body.interests
  });

  // 3) Generate JWT token (if using authentication)
  // const token = signToken(newStudent._id);

  // 4) Send response
  res.status(201).json({
    status: 'success',
    data: {
      student: newStudent
      // token // if using authentication
    }
  });
});

// Add other controller methods as needed...