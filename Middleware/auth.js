const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');

const authenticateTutor = async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ message: 'No token provided' });
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);
  
      const tutor = await Tutor.findOne({ _id: decoded.userId }); // Update this line to match the token's payload
      if (!tutor) return res.status(401).json({ message: 'Tutor not found' });
  
      req.tutor = tutor;
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Invalid token' });
    }
  };
  
module.exports = authenticateTutor;
