const express = require('express');
const multer = require('multer');
const Course = require('../models/Course');
const authenticateTutor = require('../Middleware/auth');

const router = express.Router();

const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post(
  '/',
  authenticateTutor,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'materials[]'} // Note: removed brackets
  ]),
  async (req, res) => {
    try {
      const { title, description, subject, level } = req.body;

      const newCourse = new Course({
        title,
        description,
        subject,
        level,
        tutor: req.tutor._id,
        thumbnail: req.files['thumbnail']?.[0]?.path || null,
        materials: req.files['materials']?.map(file => ({
          filename: file.originalname,
          contentType: file.mimetype,
          path: file.path // Store file path instead of buffer
        })) || []
      });

      await newCourse.save();
      res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
      console.error(error);
      // Clean up uploaded files if error occurs
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

router.get('/my/courses', authenticateTutor, async (req, res) => {
  try {
    const tutorId = req.tutor.id; // You set this in your middleware
    const courses = await Course.find({ tutor: tutorId }); // ✅ Matches the `tutor` ObjectId
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
