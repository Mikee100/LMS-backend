// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For tutor messages
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' }, // Related course
  scheduledClass: { type: mongoose.Schema.Types.ObjectId, ref: 'ScheduledClass' }, // For class notifications
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['class-reminder', 'tutor-message', 'system'], 
    default: 'system' 
  },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);