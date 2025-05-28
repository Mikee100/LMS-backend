const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'Tutor' }, // optional
  type: { type: String, enum: ['alert', 'message', 'announcement'], default: 'message' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);