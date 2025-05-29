const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  type: { type: String, enum: ['lecture_completed', 'material_downloaded', 'assignment_submitted'], required: true },
  lecture: { type: Schema.Types.ObjectId, ref: 'Lecture' },
  material: { type: Schema.Types.ObjectId, ref: 'Material' },
  assignment: { type: Schema.Types.ObjectId, ref: 'Assignment' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);