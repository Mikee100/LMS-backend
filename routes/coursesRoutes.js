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
    { name: 'materials', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const { title, description, subject, level } = req.body;

      const thumbnailFile = req.files['thumbnail']?.[0];
      const materialFiles = req.files['materials'] || [];

      const newCourse = new Course({
        title,
        description,
        subject,
        level,
        tutor: req.tutor._id,
        thumbnailFileId: thumbnailFile?.filename || null,

        // ⬇ Save both original and stored filenames
        materials: materialFiles.map(file => ({
          filename: file.filename,             // stored on disk
          originalName: file.originalname,     // original file name
          contentType: file.mimetype           // optional
        }))
      });

      await newCourse.save();
      res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);


router.put(
  '/:id',
  authenticateTutor,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'materials', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const courseId = req.params.id;
      const { title, description, subject, level } = req.body;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if the tutor owns the course
      if (course.tutor.toString() !== req.tutor._id.toString()) {
        return res.status(403).json({ message: 'Unauthorized access to update course' });
      }

      // Update text fields
      if (title) course.title = title;
      if (description) course.description = description;
      if (subject) course.subject = subject;
      if (level) course.level = level;

      // Replace thumbnail if provided
      if (req.files['thumbnail']) {
        const newThumbnail = req.files['thumbnail'][0];

        // Delete old thumbnail file from disk if exists
        if (course.thumbnail && fs.existsSync(course.thumbnail)) {
          fs.unlinkSync(course.thumbnail);
        }

        course.thumbnail = newThumbnail.path;
      }

      // Add new materials if provided
      if (req.files['materials']) {
        const newMaterials = req.files['materials'].map(file => ({
          filename: file.filename,           // actual saved name
          originalName: file.originalname,   // display name
          contentType: file.mimetype,
          path: file.path
        }));

        course.materials.push(...newMaterials);
      }

      await course.save();
      res.json({ message: 'Course updated successfully', course });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while updating course' });
    }
  }
);


// GET /api/courses/material/:filename
router.get('/material/:filename', authenticateTutor, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.sendFile(filePath);
});






router.get('/my/courses', authenticateTutor, async (req, res) => {
  try {
    const tutorId = req.tutor.id; 
    const courses = await Course.find({ tutor: tutorId }); 
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
