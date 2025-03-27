// src/api/controllers/prescriptionController.js
const { PrescriptionCrud, PatientCrud, DoctorCrud } = require('../../models/crud-operations');
const prescriptionService = require('../../services/prescriptionService');
const logger = require('../../utils/logger');

/**
 * Prescription controller for handling prescription-related operations
 */
class PrescriptionController {
  /**
   * Create a new prescription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createPrescription(req, res, next) {
    try {
      const {
        patientId,
        doctorId,
        appointmentId,
        medications,
        diagnosis,
        issuedDate,
        expiryDate,
        notes
      } = req.body;

      // Validate required fields
      if (!patientId || !doctorId || !medications || !diagnosis || !issuedDate || !expiryDate) {
        return res.status(400).json({
          error: {
            message: 'Patient ID, doctor ID, medications, diagnosis, issued date, and expiry date are required'
          }
        });
      }

      // Validate medications
      if (!Array.isArray(medications) || medications.length === 0) {
        return res.status(400).json({
          error: {
            message: 'Medications must be a non-empty array'
          }
        });
      }

      // Check if medications have required fields
      for (const medication of medications) {
        if (!medication.name || !medication.dosage || !medication.frequency) {
          return res.status(400).json({
            error: {
              message: 'Each medication must have name, dosage, and frequency'
            }
          });
        }
      }

      // Validate dates
      const issued = new Date(issuedDate);
      const expiry = new Date(expiryDate);
      
      if (isNaN(issued.getTime()) || isNaN(expiry.getTime())) {
        return res.status(400).json({
          error: {
            message: 'Invalid date format'
          }
        });
      }

      if (expiry <= issued) {
        return res.status(400).json({
          error: {
            message: 'Expiry date must be after issued date'
          }
        });
      }

      // Check if patient exists
      const patient = await PatientCrud.getById(patientId);
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      // Check if doctor exists
      const doctor = await DoctorCrud.getById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          error: {
            message: 'Doctor not found'
          }
        });
      }

      // Check if the user is the doctor or an admin
      const isAdmin = req.user.role === 'admin';
      const isDoctor = req.user.id === doctor.userId.toString();
      
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only the doctor or an admin can create prescriptions'
          }
        });
      }

      // Create prescription
      const prescriptionData = {
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        medications,
        diagnosis,
        issuedDate: issued,
        expiryDate: expiry,
        status: 'active',
        notes: notes || ''
      };

      const prescriptionId = await PrescriptionCrud.createPrescription(prescriptionData);

      res.status(201).json({
        message: 'Prescription created successfully',
        prescriptionId
      });
    } catch (error) {
      logger.error('Error in createPrescription controller:', error);
      next(error);
    }
  }

  /**
   * Get prescription by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPrescriptionById(req, res, next) {
    try {
      const { id } = req.params;

      // Get prescription with doctor and patient details
      const prescription = await prescriptionService.getPrescriptionWithDetails(id);
      
      if (!prescription) {
        return res.status(404).json({
          error: {
            message: 'Prescription not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isPatient = prescription.patientId.toString() === req.user.id || 
                        (prescription.patient && prescription.patient.userId.toString() === req.user.id);
      const isDoctor = prescription.doctorId.toString() === req.user.id || 
                       (prescription.doctor && prescription.doctor.userId.toString() === req.user.id);
      
      if (!isAdmin && !isPatient && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access this prescription'
          }
        });
      }

      res.status(200).json(prescription);
    } catch (error) {
      logger.error('Error in getPrescriptionById controller:', error);
      next(error);
    }
  }

  /**
   * Update prescription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updatePrescription(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get the current prescription
      const prescription = await PrescriptionCrud.getById(id);
      
      if (!prescription) {
        return res.status(404).json({
          error: {
            message: 'Prescription not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = prescription.doctorId.toString() === req.user.id;
      
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only the doctor or an admin can update prescriptions'
          }
        });
      }

      // Validate dates if provided
      if (updateData.issuedDate && updateData.expiryDate) {
        const issued = new Date(updateData.issuedDate);
        const expiry = new Date(updateData.expiryDate);
        
        if (isNaN(issued.getTime()) || isNaN(expiry.getTime())) {
          return res.status(400).json({
            error: {
              message: 'Invalid date format'
            }
          });
        }

        if (expiry <= issued) {
          return res.status(400).json({
            error: {
              message: 'Expiry date must be after issued date'
            }
          });
        }
      } else if (updateData.issuedDate) {
        const issued = new Date(updateData.issuedDate);
        const expiry = new Date(prescription.expiryDate);
        
        if (isNaN(issued.getTime())) {
          return res.status(400).json({
            error: {
              message: 'Invalid date format'
            }
          });
        }

        if (expiry <= issued) {
          return res.status(400).json({
            error: {
              message: 'Expiry date must be after issued date'
            }
          });
        }
      } else if (updateData.expiryDate) {
        const issued = new Date(prescription.issuedDate);
        const expiry = new Date(updateData.expiryDate);
        
        if (isNaN(expiry.getTime())) {
          return res.status(400).json({
            error: {
              message: 'Invalid date format'
            }
          });
        }

        if (expiry <= issued) {
          return res.status(400).json({
            error: {
              message: 'Expiry date must be after issued date'
            }
          });
        }
      }

      // Update prescription
      const updated = await PrescriptionCrud.update(id, updateData);

      if (!updated) {
        return res.status(500).json({
          error: {
            message: 'Failed to update prescription'
          }
        });
      }

      res.status(200).json({
        message: 'Prescription updated successfully'
      });
    } catch (error) {
      logger.error('Error in updatePrescription controller:', error);
      next(error);
    }
  }

  /**
   * Delete prescription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deletePrescription(req, res, next) {
    try {
      const { id } = req.params;

      // Only admins can delete prescriptions
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Only administrators can delete prescriptions'
          }
        });
      }

      // Delete prescription
      const deleted = await PrescriptionCrud.delete(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'Prescription not found'
          }
        });
      }

      res.status(200).json({
        message: 'Prescription deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deletePrescription controller:', error);
      next(error);
    }
  }

  /**
   * Add medication to prescription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addMedication(req, res, next) {
    try {
      const { id } = req.params;
      const medication = req.body;

      // Validate medication
      if (!medication.name || !medication.dosage || !medication.frequency) {
        return res.status(400).json({
          error: {
            message: 'Medication must have name, dosage, and frequency'
          }
        });
      }

      // Get the current prescription
      const prescription = await PrescriptionCrud.getById(id);
      
      if (!prescription) {
        return res.status(404).json({
          error: {
            message: 'Prescription not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = prescription.doctorId.toString() === req.user.id;
      
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only the doctor or an admin can add medications'
          }
        });
      }

      // Check if medication name already exists
      const existingMedication = prescription.medications.find(med => med.name === medication.name);
      
      if (existingMedication) {
        return res.status(409).json({
          error: {
            message: 'Medication with this name already exists in the prescription'
          }
        });
      }

      // Add medication
      const added = await PrescriptionCrud.addMedication(id, medication);

      if (!added) {
        return res.status(500).json({
          error: {
            message: 'Failed to add medication'
          }
        });
      }

      res.status(200).json({
        message: 'Medication added successfully'
      });
    } catch (error) {
      logger.error('Error in addMedication controller:', error);
      next(error);
    }
  }

  /**
   * Remove medication from prescription
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async removeMedication(req, res, next) {
    try {
      const { id, medicationName } = req.params;

      // Get the current prescription
      const prescription = await PrescriptionCrud.getById(id);
      
      if (!prescription) {
        return res.status(404).json({
          error: {
            message: 'Prescription not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = prescription.doctorId.toString() === req.user.id;
      
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only the doctor or an admin can remove medications'
          }
        });
      }

      // Check if medication exists
      const existingMedication = prescription.medications.find(med => med.name === medicationName);
      
      if (!existingMedication) {
        return res.status(404).json({
          error: {
            message: 'Medication not found in prescription'
          }
        });
      }

      // Remove medication
      const removed = await PrescriptionCrud.removeMedication(id, medicationName);

      if (!removed) {
        return res.status(500).json({
          error: {
            message: 'Failed to remove medication'
          }
        });
      }

      res.status(200).json({
        message: 'Medication removed successfully'
      });
    } catch (error) {
      logger.error('Error in removeMedication controller:', error);
      next(error);
    }
  }

  /**
   * Get prescriptions by patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPrescriptionsByPatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = req.user.role === 'doctor';
      
      // Get patient to check if current user is the patient
      let isOwner = false;
      
      if (req.user.role === 'patient') {
        const patient = await PatientCrud.getPatientByUserId(req.user.id);
        isOwner = patient && patient._id.toString() === patientId;
      }
      
      if (!isAdmin && !isDoctor && !isOwner) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access these prescriptions'
          }
        });
      }

      // Build filter
      const filter = { patientId };
      if (status) {
        filter.status = status;
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get prescriptions
      const prescriptions = await PrescriptionCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { issuedDate: -1 }
      });

      // Count total prescriptions for pagination
      const total = await PrescriptionCrud.count(filter);

      // Get doctor details
      const prescriptionsWithDetails = await prescriptionService.getPrescriptionsWithDoctorDetails(prescriptions);

      res.status(200).json({
        prescriptions: prescriptionsWithDetails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getPrescriptionsByPatient controller:', error);
      next(error);
    }
  }

  /**
   * Get prescriptions by doctor
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPrescriptionsByDoctor(req, res, next) {
    try {
      const { doctorId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      
      // Check if current user is the doctor
      let isOwner = false;
      
      if (req.user.role === 'doctor') {
        const doctor = await DoctorCrud.getDoctorByUserId(req.user.id);
        isOwner = doctor && doctor._id.toString() === doctorId;
      }
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access these prescriptions'
          }
        });
      }

      // Build filter
      const filter = { doctorId };
      if (status) {
        filter.status = status;
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get prescriptions
      const prescriptions = await PrescriptionCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { issuedDate: -1 }
      });

      // Count total prescriptions for pagination
      const total = await PrescriptionCrud.count(filter);

      // Get patient details
      const prescriptionsWithDetails = await prescriptionService.getPrescriptionsWithPatientDetails(prescriptions);

      res.status(200).json({
        prescriptions: prescriptionsWithDetails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getPrescriptionsByDoctor controller:', error);
      next(error);
    }
  }

  /**
   * Get active prescriptions for the current patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getActivePatientPrescriptions(req, res, next) {
    try {
      // Get patient profile for current user
      const patient = await PatientCrud.getPatientByUserId(req.user.id);
      
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient profile not found'
          }
        });
      }

      // Get active prescriptions
      const prescriptions = await PrescriptionCrud.getActivePrescriptionsForPatient(patient._id);

      // Get doctor details
      const prescriptionsWithDetails = await prescriptionService.getPrescriptionsWithDoctorDetails(prescriptions);

      res.status(200).json(prescriptionsWithDetails);
    } catch (error) {
      logger.error('Error in getActivePatientPrescriptions controller:', error);
      next(error);
    }
  }

  /**
   * Update prescription status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updatePrescriptionStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!status || !['active', 'expired', 'cancelled'].includes(status)) {
        return res.status(400).json({
          error: {
            message: 'Valid status is required (active, expired, or cancelled)'
          }
        });
      }

      // Get the current prescription
      const prescription = await PrescriptionCrud.getById(id);
      
      if (!prescription) {
        return res.status(404).json({
          error: {
            message: 'Prescription not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isDoctor = prescription.doctorId.toString() === req.user.id;
      
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Only the doctor or an admin can update prescription status'
          }
        });
      }

      // Update status
      const updated = await PrescriptionCrud.updateStatus(id, status);

      if (!updated) {
        return res.status(500).json({
          error: {
            message: 'Failed to update prescription status'
          }
        });
      }

      res.status(200).json({
        message: 'Prescription status updated successfully'
      });
    } catch (error) {
      logger.error('Error in updatePrescriptionStatus controller:', error);
      next(error);
    }
  }
}

module.exports = new PrescriptionController();