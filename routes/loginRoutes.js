// authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');

const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Determine which model to use based on role
    let Model;
    switch(role) {
      case 'tutors': Model = Tutor; break;
      case 'students': Model = Student; break;
      
      default: return res.status(400).json({ message: 'Invalid role' });
    }


    // Find user
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: role,
        name: `${user.firstName} ${user.lastName}`
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const userData = user.toObject();
    delete userData.password;
    delete userData.__v;

    res.json({
      token,
      user: {
        ...userData,
        role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;