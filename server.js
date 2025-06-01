const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
require('dotenv').config();

const tutorRoutes = require('./routes/tutorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes'); 
const coursesRoute = require('./routes/coursesRoutes');
const schedulesRoute = require('./routes/schedulesRoute');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const noticationsRoute = require('./routes/notificationsRoute');
const messageRoutes = require('./routes/messageRoutes');
const progressRoutes = require('./routes/progressRoutes');
const activityRoutes = require('./routes/activityRoutes');
const studentProfileRoutes = require('./routes/studentProfileRoutes');

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// This line is critical:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/schedule', schedulesRoute);
app.use('/api/enroll/students', enrollmentRoutes);
app.use('/api/notifications', noticationsRoute)
app.use('/api/messages',messageRoutes)

app.use('/api/progress', progressRoutes);

app.use('/api/activity', activityRoutes);

//courses route
app.use('/api/courses', coursesRoute);

app.use('/api/students', studentProfileRoutes);


// Express route (backend)

app.post('/api/assignments/generate', async (req, res) => {
  const { materialFilename } = req.body;
  const pdfPath = `/path/to/materials/${materialFilename}`; // Adjust as needed

  const py = spawn('python', ['Assignment.py', pdfPath]);
  let output = '';
  py.stdout.on('data', (data) => { output += data.toString(); });
  py.stderr.on('data', (data) => { console.error(data.toString()); });
  py.on('close', (code) => {
    if (code !== 0) return res.status(500).json({ message: 'Python script failed' });
    // Parse output as needed
    res.json({ assignment: output });
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));



 
