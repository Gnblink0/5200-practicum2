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
} = require("../controllers/userController");

// Register route (no auth required)
router.post("/register", registerUser);

// Profile routes (require auth)
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.delete("/profile", auth, deleteUserProfile);

// Admin routes (require user_management permission)
router.get("/", auth, requirePermission("user_management"), getAllUsers);

module.exports = router;
