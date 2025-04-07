// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  registerUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getAllUsers,
} = require("../controllers/userController");

// Register route
router.post("/register", registerUser);

// Profile routes
router.get("/profile", auth, getUserProfile);
router.put("/profile", auth, updateUserProfile);
router.delete("/profile", auth, deleteUserProfile);

// Get all users (for admin)
router.get("/", auth, getAllUsers);

module.exports = router;
