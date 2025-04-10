const Admin = require("../models/Admin");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

// Cache user lookups for 5 minutes
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      userCache.delete(key);
    }
  }
};

// Clear expired cache entries every minute
setInterval(clearExpiredCache, 60 * 1000);

const findUserInCache = (email, uid) => {
  const key = `${email.toLowerCase()}:${uid}`;
  const cached = userCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  return null;
};

const cacheUser = (email, uid, user) => {
  const key = `${email.toLowerCase()}:${uid}`;
  userCache.set(key, {
    user,
    timestamp: Date.now(),
  });
};

const auth = async (req, res, next) => {
  try {
    const email = req.header("X-User-Email");
    const uid = req.header("X-User-UID");

    if (!email || !uid) {
      return res.status(401).json({ error: "Missing authentication headers" });
    }

    // first clear the user data in cache, force to get the latest data
    const key = `${email.toLowerCase()}:${uid}`;
    userCache.delete(key);

    // find user
    const [admin, patient, doctor] = await Promise.all([
      Admin.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        uid,
      }),
      Patient.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        uid,
      }),
      Doctor.findOne({
        email: { $regex: new RegExp(`^${email}$`, "i") },
        uid,
      }),
    ]);

    const user = admin || patient || doctor;

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: "User account is inactive",
        message:
          "Your account has been deactivated. Please contact an administrator.",
      });
    }

    // if user exists and active, then add to cache
    cacheUser(email, uid, user);

    req.user = user;
    req.userRole = user.constructor.modelName;

    // Log successful auth
    console.log("Auth successful:", {
      email,
      role: req.userRole,
      permissions: user.permissions || [],
    });

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    // Check if user is admin and has the required permission
    if (
      req.userRole !== "Admin" ||
      !req.user.permissions?.includes(permission)
    ) {
      console.error("Permission denied:", {
        userRole: req.userRole,
        requiredPermission: permission,
        userPermissions: req.user.permissions || [],
      });
      return res.status(403).json({ error: "Permission denied" });
    }
    next();
  };
};

module.exports = { auth, requirePermission };
