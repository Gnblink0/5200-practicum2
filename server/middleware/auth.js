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
  const key = `${email}:${uid}`;
  const cached = userCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }
  return null;
};

const cacheUser = (email, uid, user) => {
  const key = `${email}:${uid}`;
  userCache.set(key, {
    user,
    timestamp: Date.now()
  });
};

const auth = async (req, res, next) => {
  try {
    const email = req.header("X-User-Email");
    const uid = req.header("X-User-UID");

    if (!email || !uid) {
      console.error("Auth failed: Missing headers", { email: !!email, uid: !!uid });
      throw new Error("Missing authentication headers");
    }

    // Check cache first
    let user = findUserInCache(email, uid);

    if (!user) {
      // Find user in any collection
      const [admin, patient, doctor] = await Promise.all([
        Admin.findOne({ email, uid }),
        Patient.findOne({ email, uid }),
        Doctor.findOne({ email, uid })
      ]);

      user = admin || patient || doctor;

      if (user) {
        // Cache the found user
        cacheUser(email, uid, user);
      }
    }

    if (!user) {
      console.error("Auth failed: User not found", { email });
      throw new Error("User not found");
    }

    if (!user.isActive) {
      console.error("Auth failed: Inactive user", { email, userId: user._id });
      throw new Error("User account is inactive");
    }

    // Add user and role info to request
    req.user = user;
    req.userRole = user.constructor.modelName;

    // Log successful auth
    console.log("Auth successful:", {
      email,
      role: req.userRole,
      permissions: user.permissions || []
    });

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: error.message || "Please authenticate" });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    // Check if user is admin and has the required permission
    if (req.userRole !== "Admin" || !req.user.permissions?.includes(permission)) {
      console.error("Permission denied:", {
        userRole: req.userRole,
        requiredPermission: permission,
        userPermissions: req.user.permissions || []
      });
      return res.status(403).json({ error: "Permission denied" });
    }
    next();
  };
};

module.exports = { auth, requirePermission };
