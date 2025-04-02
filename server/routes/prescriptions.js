const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const Prescription = require('../models/Prescription');

// Create new prescription
router.post('/', auth, checkRole(['doctor', 'admin']), async (req, res) => {
  try {
    const prescription = new Prescription({
      ...req.body,
      doctor: req.user.role === 'doctor' ? req.user._id : req.body.doctor
    });
    await prescription.save();
    res.status(201).json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all prescriptions (with filters)
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

    const prescriptions = await Prescription.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email')
      .sort({ date: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get single prescription
router.get('/:id', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check if user has permission to view this prescription
    if (req.user.role === 'patient' && prescription.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (req.user.role === 'doctor' && prescription.doctor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update prescription
router.patch('/:id', auth, checkRole(['doctor', 'admin']), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    // Check if user has permission to update this prescription
    if (req.user.role === 'doctor' && prescription.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Object.assign(prescription, req.body);
    await prescription.save();

    res.json(prescription);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete prescription
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 