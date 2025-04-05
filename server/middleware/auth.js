const Admin = require("../models/Admin");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

const auth = async (req, res, next) => {
  try {
    const email = req.header("X-User-Email");
    const uid = req.header("X-User-UID");

    if (!email || !uid) {
      throw new Error("Missing authentication headers");
    }

    // Find user in any collection
    const admin = await Admin.findOne({ email, uid });
    const patient = await Patient.findOne({ email, uid });
    const doctor = await Doctor.findOne({ email, uid });

    const user = admin || patient || doctor;

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Please authenticate" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};

module.exports = { auth, checkRole };
