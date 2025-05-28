// middlewares/classNotifications.js
const Notifications = require('../models/Notifications');
const Enrollment = require('../models/Enrollment');

const sendClassNotifications = async (scheduledClass) => {
  try {
    // Get all students enrolled in this course
    const enrollments = await Enrollment.find({ 
      course: scheduledClass.course 
    }).populate('student');

    // Create notifications for each student
    const notifications = enrollments.map(enrollment => ({
      user: enrollment.student._id,
      course: scheduledClass.course,
      scheduledClass: scheduledClass._id,
      message: `New class scheduled: ${scheduledClass.title} on ${new Date(scheduledClass.start).toLocaleString()}`,
      type: 'class-reminder'
    }));

    await Notification.insertMany(notifications);
    
    console.log(`Sent ${notifications.length} class notifications`);
  } catch (err) {
    console.error('Error sending class notifications:', err);
  }
};

module.exports = { sendClassNotifications };