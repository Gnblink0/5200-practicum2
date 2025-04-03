const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Appointment = require('../models/Appointment');

// Create new appointment
router.post('/', auth, checkRole(['patient', 'admin']), async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      patient: req.user.role === 'patient' ? req.user._id : req.body.patient
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all appointments (with filters)
router.get('/', auth, async (req, res) => {
  try {
    const query = {};
    
    // Filter by role
    if (req.user.role === 'patient') {
      query.patient = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user._id;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single appointment
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has permission to view this appointment
    if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update appointment
router.patch('/:id', auth, checkRole(['doctor', 'admin']), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has permission to update this appointment
    if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.assign(appointment, req.body);
    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete appointment
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 