const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Enhanced login endpoint with logging
router.post('/login', async (req, res) => {
  console.log('[Auth] Login attempt:', {
    email: req.body.email,
    role: req.body.role,
    timestamp: new Date().toISOString()
  });

  try {
    const { email, password, role } = req.body;

    console.log(`[Auth] Validating ${role} login`);
    if (!['tutor', 'student'].includes(role)) {
      console.warn('[Auth] Invalid role specified:', role);
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    console.log('[Auth] Searching for user...');
    const UserModel = role === 'tutor' ? Tutor : Student;
    // Explicitly select the password field (since it's excluded by default)
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      console.warn('[Auth] User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[Auth] Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn('[Auth] Password mismatch for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[Auth] Creating JWT token...');
    const token = jwt.sign(
      {
        userId: user._id,
        role: role,
        email: user.email
      },
      process.env.JWT_SECRET,
    { expiresIn: '30d' }
    );

    console.log('[Auth] Login successful for:', email);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role
      }
    });

  } catch (err) {
    console.error('[Auth] Login error:', {
      message: err.message,
      stack: err.stack,
      input: req.body
    });
    res.status(500).json({ message: 'Internal server error' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

  // Token verification endpoint
  router.get('/verifyToken', authenticateToken, async (req, res) => {
    try {
      const email = req.user.email;

      // Try to find user in tutors
      let user = await Tutor.findOne({ email });
      if (user) {
        return res.json({ user: { email: user.email, role: 'tutor' } });
      }

      // Try to find user in students
      user = await Student.findOne({ email });
      if (user) {
        return res.json({ user: { email: user.email, role: 'student' } });
      }

      // If user not found in either collection, log and return 404
      console.warn(`[Auth] User not found during token verification: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    } catch (error) {
      console.error('Verify token error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });


router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    // Try to find user in tutors
    let user = await Tutor.findOne({ email });
    let role = 'tutor';
    if (!user) {
      // Try to find user in students
      user = await Student.findOne({ email });
      role = 'student';
    }

    // If user doesn't exist, create as student by default
    if (!user) {
      user = await Student.create({
        email,
        firstName: name?.split(' ')[0] || name,
        lastName: name?.split(' ').slice(1).join(' ') || '',
        googleId,
      });
      role = 'student';
    }

    // Issue JWT
    const jwtToken = jwt.sign(
      {
        userId: user._id,
        role: role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : name,
        email: user.email,
        role
      }
    });
  } catch (err) {
    console.error('[Auth] Google login error:', {
      message: err.message,
      stack: err.stack,
      input: req.body
    });
    res.status(401).json({ message: 'Google login failed' });
  }
});
module.exports = router;
