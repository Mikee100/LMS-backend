const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  subject: String,
  level: String,
  thumbnail: Buffer,
  materials: [
    {
      filename: String,       // Stored filename (on disk)
      originalName: String,   // Original filename from user
      contentType: String,
      path: String    
    }
    ],
  
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
});

module.exports = mongoose.model('Course', courseSchema);
