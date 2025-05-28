const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'Tutor', required: true },
  recipients: [{ type: Schema.Types.ObjectId, ref: 'Student', required: true }],
  course: { type: Schema.Types.ObjectId, ref: 'Course' }, // optional, for announcements/group
  content: { type: String, required: true },
  type: { type: String, enum: ['announcement', 'direct', 'group'], required: true },
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'Student' }]
});

module.exports = mongoose.model('Message', messageSchema);