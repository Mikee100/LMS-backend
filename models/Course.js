const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  subject: String,
  level: String,
  thumbnail: Buffer,
  materials: [
    {
      filename: String,
      contentType: String,
      data: Buffer,
    },
  ],
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
  },
});

module.exports = mongoose.model('Course', courseSchema);
