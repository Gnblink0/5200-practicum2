const express = require("express");
const router = express.Router();
const { auth, requirePermission } = require("../middleware/auth");
const {
  getAllAdmins,
  getAdminById,
  updateAdminPermissions,
  updateAdminStatus,
} = require("../controllers/adminController");

// All admin routes require user_management permission
router.use(auth, requirePermission("user_management"));

// Get all admins
router.get("/", getAllAdmins);

// Get single admin
router.get("/:id", getAdminById);

// Update admin permissions
router.put("/:id/permissions", updateAdminPermissions);

// Update admin status
router.put("/:id/status", updateAdminStatus);

module.exports = router;
