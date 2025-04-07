const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getAllAdmins,
  getAdminById,
  updateAdminPermissions,
  updateAdminStatus,
} = require("../controllers/adminController");

// Get all admins
router.get("/", auth, getAllAdmins);

// Get single admin
router.get("/:id", auth, getAdminById);

// Update admin permissions
router.put("/:id/permissions", auth, updateAdminPermissions);

// Update admin status
router.put("/:id/status", auth, updateAdminStatus);

module.exports = router;
