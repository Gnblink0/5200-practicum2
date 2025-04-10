// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { auth, requirePermission } = require("../middleware/auth");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
  updateUserStatus,
} = require("../controllers/userController");

// Register route (no auth required)
router.post("/register", registerUser);

// Profile routes (require auth)
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.delete("/profile", auth, deleteUserProfile);

// Admin routes (require read_all_users permission)
router.get("/", auth, requirePermission("READ_ALL_USERS"), getAllUsers);
router.put(
  "/:userId/status",
  auth,
  requirePermission("MANAGE_USER_STATUS"),
  updateUserStatus
);

module.exports = router;
