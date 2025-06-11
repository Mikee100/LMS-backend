const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  sectionId: { type: String, required: true },
  lectureId: { type: String, required: true }, // Add this line to track the specific lecture
  materialFilename: String,
  questions: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
