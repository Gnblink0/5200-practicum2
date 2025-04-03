const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const email = req.header('X-User-Email');
    const uid = req.header('X-User-UID');
    
    if (!email || !uid) {
      throw new Error('Missing authentication headers');
    }

    // Find user by email and uid in MongoDB
    const user = await Admin.findOne({ email, uid });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
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