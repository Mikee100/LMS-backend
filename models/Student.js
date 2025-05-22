const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');6
const validator = require('validator');

const studentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        // Student must be at least 13 years old
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
        return value <= minAgeDate;
      },
      message: 'You must be at least 13 years old to register'
    }
  },
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  interests: {
    type: [String],
    required: [true, 'At least one interest is required'],
    enum: {
      values: [
        'Computer Science',
        'Business',
        'Engineering',
        'Arts',
        'Mathematics',
        'Biology',
        'Physics',
        'Chemistry'
      ],
      message: 'Invalid interest selected'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Remove sensitive data when sending JSON response
studentSchema.methods.toJSON = function() {
  const student = this.toObject();
  delete student.password;
  delete student.active;
  return student;
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;