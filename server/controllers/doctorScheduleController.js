const DoctorSchedule = require("../models/DoctorSchedule");
const User = require("../models/User");

// get doctor's all schedules
const getSchedules = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can access schedules" });
    }

    const schedules = await DoctorSchedule.find({
      doctorId: req.user._id,
      startTime: { $gte: new Date().setHours(0, 0, 0, 0) },
    }).sort({ startTime: 1 });

    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create a new schedule
const createSchedule = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can create schedules" });
    }

    const { startTime, endTime } = req.body;

    console.log('Creating schedule with times:', {
      startTime,
      endTime,
      parsedStartTime: new Date(startTime).toISOString(),
      parsedEndTime: new Date(endTime).toISOString()
    });

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (start >= end) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    // Check if the time slot conflicts with existing schedules
    const conflictingSchedule = await DoctorSchedule.findOne({
      doctorId: req.user._id,
      $or: [
        {
          startTime: { $lte: start },
          endTime: { $gt: start },
        },
        {
          startTime: { $lt: end },
          endTime: { $gte: end },
        },
      ],
    });

    if (conflictingSchedule) {
      console.log('Found conflicting schedule:', {
        existing: {
          startTime: conflictingSchedule.startTime.toISOString(),
          endTime: conflictingSchedule.endTime.toISOString()
        },
        new: {
          startTime: start.toISOString(),
          endTime: end.toISOString()
        }
      });

      return res.status(400).json({
        error: "This time slot conflicts with an existing schedule",
      });
    }

    const schedule = new DoctorSchedule({
      doctorId: req.user._id,
      startTime: start,
      endTime: end,
      isAvailable: true,
    });

    await schedule.save();
    console.log('Created schedule:', {
      id: schedule._id,
      startTime: schedule.startTime.toISOString(),
      endTime: schedule.endTime.toISOString()
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(400).json({ error: error.message });
  }
};

// update a schedule
const updateSchedule = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can update schedules" });
    }

    const { startTime, endTime, isAvailable } = req.body;
    const scheduleId = req.params.id;

    // ensure the schedule is for the doctor himself
    const schedule = await DoctorSchedule.findOne({
      _id: scheduleId,
      doctorId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // if updating time, check if it conflicts with other schedules
    if (startTime || endTime) {
      const conflictingSchedule = await DoctorSchedule.findOne({
        doctorId: req.user._id,
        _id: { $ne: scheduleId },
        $or: [
          {
            startTime: { $lte: startTime || schedule.startTime },
            endTime: { $gt: startTime || schedule.startTime },
          },
          {
            startTime: { $lt: endTime || schedule.endTime },
            endTime: { $gte: endTime || schedule.endTime },
          },
        ],
      });

      if (conflictingSchedule) {
        return res.status(400).json({
          error: "This time slot conflicts with an existing schedule",
        });
      }
    }

    Object.assign(schedule, {
      startTime: startTime || schedule.startTime,
      endTime: endTime || schedule.endTime,
      isAvailable:
        isAvailable !== undefined ? isAvailable : schedule.isAvailable,
    });

    await schedule.save();
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a schedule
const deleteSchedule = async (req, res) => {
  try {
    if (req.user.role !== "Doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can delete schedules" });
    }

    const schedule = await DoctorSchedule.findOneAndDelete({
      _id: req.params.id,
      doctorId: req.user._id,
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get available time slots for a specific doctor
const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // Validate doctor exists and is active
    const doctor = await User.findOne({ 
      _id: doctorId, 
      role: "Doctor", 
      isActive: true 
    }).select('firstName lastName specialization');

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found or inactive" });
    }

    // If date is provided, filter by date
    let query = {
      doctorId,
      isAvailable: true,
      startTime: { $gte: new Date() }
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.startTime = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    const availableSlots = await DoctorSchedule.find(query)
      .sort({ startTime: 1 })
      .lean();

    // Group slots by date while keeping original date format
    const groupedSlots = availableSlots.reduce((acc, slot) => {
      const date = slot.startTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push({
        _id: slot._id,
        doctorId: slot.doctorId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      });
      return acc;
    }, {});

    res.json({
      doctor: {
        id: doctor._id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        specialization: doctor.specialization
      },
      availableSlots: groupedSlots
    });
  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAvailableSlots
};
