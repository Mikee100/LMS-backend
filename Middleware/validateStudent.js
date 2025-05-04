// middleware/validateStudent.js
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

// Named export for register validation
exports.register = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  // Add other validations...
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError(errors.array()[0].msg, 400));
    }
    next();
  }
];

// Add other validation chains as needed