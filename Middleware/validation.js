const { body, validationResult } = require('express-validator');

const validateTutor = [
  // Step 1 validation
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  // Step 2 validation
  body('expertise').notEmpty().withMessage('Expertise is required'),
  body('institution').notEmpty().withMessage('Institution is required'),
  body('experience').notEmpty().withMessage('Experience is required'),
  body('bio')
    .notEmpty().withMessage('Bio is required')
    .isLength({ min: 50 }).withMessage('Bio must be at least 50 characters'),

  // Step 4 validation
  body('hourlyRate')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateTutor };