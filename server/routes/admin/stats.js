const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Appointment = require('../../models/Appointment');
const Prescription = require('../../models/Prescription');

// Get user statistics
router.get('/users', async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);
    res.json(userStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get appointment statistics
router.get('/appointments', async (req, res) => {
  try {
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);
    res.json(appointmentStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get prescription statistics
router.get('/prescriptions', async (req, res) => {
  try {
    const prescriptionStats = await Prescription.aggregate([
      {
        $group: {
          _id: '$medication',
          value: { $sum: 1 }
        }
      },
      {
        $project: {
          name: '$_id',
          value: 1,
          _id: 0
        }
      }
    ]);
    res.json(prescriptionStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get activity heatmap data
router.get('/activity', async (req, res) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);

    const activityData = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: twentyFourHoursAgo }
        }
      },
      {
        $group: {
          _id: {
            $hour: '$createdAt'
          },
          activity: { $sum: 1 }
        }
      },
      {
        $project: {
          time: '$_id',
          activity: 1,
          _id: 0
        }
      },
      {
        $sort: { time: 1 }
      }
    ]);

    res.json(activityData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 