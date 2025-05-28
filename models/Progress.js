const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const progressSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLectures: [{ type: Schema.Types.ObjectId }], // Array of lecture IDs
  completedMaterials: [{ type: Schema.Types.ObjectId }], // Optional: Array of material IDs
  lastAccessed: { type: Date, default: Date.now }
});

progressSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);