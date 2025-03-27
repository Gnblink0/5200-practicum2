// src/api/controllers/patientController.js
const { PatientCrud, UserCrud } = require('../../models/crud-operations');
const patientService = require('../../models/services/patientService');
const logger = require('../../utils/logger');

/**
 * Patient controller for handling patient-related operations
 */
class PatientController {
  /**
   * Create a patient profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createPatient(req, res, next) {
    try {
      const { userId, personalInfo, medicalHistory, insuranceInfo, emergencyContacts } = req.body;

      // Check if the user exists and has 'patient' role
      const user = await UserCrud.getById(userId);
      
      if (!user) {
        return res.status(404).json({
          error: {
            message: 'User not found'
          }
        });
      }

      if (user.role !== 'patient') {
        return res.status(400).json({
          error: {
            message: 'User is not a patient'
          }
        });
      }

      // Check if patient profile already exists for this user
      const existingPatient = await PatientCrud.getPatientByUserId(userId);
      
      if (existingPatient) {
        return res.status(409).json({
          error: {
            message: 'Patient profile already exists for this user'
          }
        });
      }

      // Create patient profile
      const patientId = await PatientCrud.createPatient({
        userId,
        personalInfo,
        medicalHistory: medicalHistory || [],
        insuranceInfo: insuranceInfo || {},
        emergencyContacts: emergencyContacts || []
      });

      res.status(201).json({
        message: 'Patient profile created successfully',
        patientId
      });
    } catch (error) {
      logger.error('Error in createPatient controller:', error);
      next(error);
    }
  }

  /**
   * Get current patient's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getCurrentPatient(req, res, next) {
    try {
      const userId = req.user.id;

      // Get patient by user ID
      const patient = await PatientCrud.getPatientByUserId(userId);
      
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient profile not found'
          }
        });
      }

      res.status(200).json(patient);
    } catch (error) {
      logger.error('Error in getCurrentPatient controller:', error);
      next(error);
    }
  }

  /**
   * Update current patient's profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateCurrentPatient(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Get patient by user ID
      const patient = await PatientCrud.getPatientByUserId(userId);
      
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient profile not found'
          }
        });
      }

      // Update patient
      const updated = await PatientCrud.update(patient._id, updateData);

      if (!updated) {
        return res.status(500).json({
          error: {
            message: 'Failed to update patient profile'
          }
        });
      }

      res.status(200).json({
        message: 'Patient profile updated successfully'
      });
    } catch (error) {
      logger.error('Error in updateCurrentPatient controller:', error);
      next(error);
    }
  }

  /**
   * Get patient by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPatientById(req, res, next) {
    try {
      const { id } = req.params;

      // Get patient by ID
      const patient = await PatientCrud.getById(id);
      
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      res.status(200).json(patient);
    } catch (error) {
      logger.error('Error in getPatientById controller:', error);
      next(error);
    }
  }

  /**
   * Update patient by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updatePatient(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Update patient
      const updated = await PatientCrud.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      res.status(200).json({
        message: 'Patient updated successfully'
      });
    } catch (error) {
      logger.error('Error in updatePatient controller:', error);
      next(error);
    }
  }

  /**
   * Delete patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deletePatient(req, res, next) {
    try {
      const { id } = req.params;

      // Use service to delete patient and related data
      const deleted = await patientService.deletePatientAndRelatedData(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      res.status(200).json({
        message: 'Patient and related data deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deletePatient controller:', error);
      next(error);
    }
  }

  /**
   * Get all patients with filtering and pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getAllPatients(req, res, next) {
    try {
      const { name, gender, page = 1, limit = 10 } = req.query;

      // Build filter
      let filter = {};
      
      if (name) {
        filter = {
          $or: [
            { 'personalInfo.firstName': { $regex: name, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: name, $options: 'i' } }
          ]
        };
      }
      
      if (gender) {
        filter['personalInfo.gender'] = gender;
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get patients
      const patients = await PatientCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { 'personalInfo.lastName': 1, 'personalInfo.firstName': 1 }
      });

      // Count total patients for pagination
      const total = await PatientCrud.count(filter);

      res.status(200).json({
        patients,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getAllPatients controller:', error);
      next(error);
    }
  }

  /**
   * Add medical history record to patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addMedicalHistory(req, res, next) {
    try {
      const { id } = req.params;
      const historyRecord = req.body;

      // Ensure required fields are present
      if (!historyRecord.condition || !historyRecord.diagnosisDate) {
        return res.status(400).json({
          error: {
            message: 'Condition and diagnosis date are required'
          }
        });
      }

      // Validate date
      if (isNaN(new Date(historyRecord.diagnosisDate).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Invalid diagnosis date format'
          }
        });
      }

      // Add medical history record
      const added = await PatientCrud.addMedicalHistory(id, {
        ...historyRecord,
        diagnosisDate: new Date(historyRecord.diagnosisDate)
      });

      if (!added) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      res.status(200).json({
        message: 'Medical history record added successfully'
      });
    } catch (error) {
      logger.error('Error in addMedicalHistory controller:', error);
      next(error);
    }
  }

  /**
   * Get patient's medical history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getMedicalHistory(req, res, next) {
    try {
      const { id } = req.params;

      // Get patient
      const patient = await PatientCrud.getById(id);
      
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      // Get comprehensive medical history
      const medicalHistory = await patientService.getComprehensiveMedicalHistory(id);

      res.status(200).json(medicalHistory);
    } catch (error) {
      logger.error('Error in getMedicalHistory controller:', error);
      next(error);
    }
  }
}

module.exports = new PatientController();