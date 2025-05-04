const mongoose = require('mongoose');
const { Schema } = mongoose;

const tutorSchema = new Schema({
  // Step 1: Account Information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/\S+@\S+\.\S+/, 'is invalid']
  },
  password: { type: String, required: true },
  
  // Step 2: Professional Information
  expertise: { type: [String], required: true },
  institution: { type: String, required: true },
  experience: { type: String, required: true },
  bio: { type: String, required: true, minlength: 50 },
  
  // Step 3: Documents & Links
  profilePhoto: { type: String }, // URL to stored image
  resume: { type: String }, // URL to stored file
  linkedin: { type: String },
  github: { type: String },
  
  // Step 4: Availability & Preferences
  availability: { type: [String], enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  teachingMethod: { 
    type: String, 
    enum: ['lecture', 'interactive', 'project', 'flipped', 'hybrid'] 
  },
  hourlyRate: { type: Number, min: 0 },
  
  // System fields
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for searchable fields
tutorSchema.index({ firstName: 'text', lastName: 'text', expertise: 'text', bio: 'text' });

module.exports = mongoose.model('Tutor', tutorSchema);