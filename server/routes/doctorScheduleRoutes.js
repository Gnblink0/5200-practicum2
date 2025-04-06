const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/doctorScheduleController");

router.get("/", auth, getSchedules);
router.post("/", auth, createSchedule);
router.put("/:id", auth, updateSchedule);
router.delete("/:id", auth, deleteSchedule);

module.exports = router;
