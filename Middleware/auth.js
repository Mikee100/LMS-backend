const jwt = require('jsonwebtoken');
const Tutor = require('../models/Tutor');

const authenticateTutor = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Fallback: read token from query string
    if (!token) token = req.query.token;
    
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 

    const tutor = await Tutor.findOne({ _id: decoded.userId });
    if (!tutor) return res.status(401).json({ message: 'Tutor not found' });

    req.tutor = tutor;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
};


  
module.exports = authenticateTutor;
