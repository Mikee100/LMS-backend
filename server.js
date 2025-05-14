const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const tutorRoutes = require('./routes/tutorRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes'); 
const coursesRoute = require('./routes/coursesRoutes');
const schedulesRoute = require('./routes/schedulesRoute');
const app = express();

const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());


app.use('/api/students', studentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/schedule', schedulesRoute)

//courses route
app.use('/api/courses', coursesRoute);


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));



 
