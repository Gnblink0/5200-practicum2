const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const Admin = require('../models/Admin');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // Add your Firebase project configuration here
});

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      throw new Error('No authentication token provided');
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    // Find user by Firebase UID
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = await Admin.findOne({ firebaseUid });
    }
    if (!user) {
      user = await Doctor.findOne({ firebaseUid });
    }
    if (!user) {
      user = await Patient.findOne({ firebaseUid });
    }

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

module.exports = { auth, checkRole }; 