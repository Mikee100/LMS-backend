const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  filename: String,       // Stored filename (on disk)
  originalName: String,   // Original filename from user
  contentType: String,
  path: String,
  size: Number,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const lectureSchema = new mongoose.Schema({
  title: String,
  description: String,
  videoUrl: String,
  materials: [materialSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const sectionSchema = new mongoose.Schema({
  title: String,
  description: String,
  materials: [materialSchema],
  lectures: [lectureSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  subject: String,
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  thumbnail: {
    filename: String,
    originalName: String,
    contentType: String,
    path: String,
    size: Number
  },
  sections: [sectionSchema],
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Course', courseSchema);