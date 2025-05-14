const mongoose = require('mongoose');

const ScheduledClassSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  description: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, required: true }
});

module.exports = mongoose.model('ScheduledClass', ScheduledClassSchema);
