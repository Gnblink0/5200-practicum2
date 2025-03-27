// src/api/controllers/paymentController.js
const { PaymentCrud, AppointmentCrud, PatientCrud } = require('../../models/crud-operations');
const paymentService = require('../../services/paymentService');
const logger = require('../../utils/logger');

/**
 * Payment controller for handling payment-related operations
 */
class PaymentController {
  /**
   * Create a new payment record
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createPayment(req, res, next) {
    try {
      const {
        appointmentId,
        patientId,
        amount,
        paymentMethod,
        status,
        notes
      } = req.body;

      // Validate required fields
      if (!appointmentId || !patientId || !amount || !paymentMethod) {
        return res.status(400).json({
          error: {
            message: 'Appointment ID, patient ID, amount, and payment method are required'
          }
        });
      }

      // Check if the appointment exists
      const appointment = await AppointmentCrud.getById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // Check if the patient exists
      const patient = await PatientCrud.getById(patientId);
      
      if (!patient) {
        return res.status(404).json({
          error: {
            message: 'Patient not found'
          }
        });
      }

      // Ensure the patient ID matches the appointment's patient
      if (appointment.patientId.toString() !== patientId) {
        return res.status(400).json({
          error: {
            message: 'Patient ID does not match the appointment\'s patient'
          }
        });
      }

      // Check if a payment already exists for this appointment
      const existingPayment = await PaymentCrud.getPaymentByAppointmentId(appointmentId);
      
      if (existingPayment) {
        return res.status(409).json({
          error: {
            message: 'A payment record already exists for this appointment'
          }
        });
      }

      // Create payment record
      const paymentData = {
        appointmentId,
        patientId,
        amount,
        paymentMethod,
        status: status || 'pending',
        transactionDate: null,
        paymentDetails: {},
        notes: notes || ''
      };

      const paymentId = await PaymentCrud.createPayment(paymentData);

      res.status(201).json({
        message: 'Payment record created successfully',
        paymentId
      });
    } catch (error) {
      logger.error('Error in createPayment controller:', error);
      next(error);
    }
  }

  /**
   * Get payment by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPaymentById(req, res, next) {
    try {
      const { id } = req.params;

      // Get payment with appointment and patient details
      const payment = await paymentService.getPaymentWithDetails(id);
      
      if (!payment) {
        return res.status(404).json({
          error: {
            message: 'Payment not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isPatient = payment.patientId.toString() === req.user.id || 
                        (payment.patient && payment.patient.userId.toString() === req.user.id);
      const isDoctor = payment.appointment && 
                       (payment.appointment.doctorId.toString() === req.user.id);
      
      if (!isAdmin && !isPatient && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access this payment'
          }
        });
      }

      res.status(200).json(payment);
    } catch (error) {
      logger.error('Error in getPaymentById controller:', error);
      next(error);
    }
  }

  /**
   * Get payment by appointment ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPaymentByAppointment(req, res, next) {
    try {
      const { appointmentId } = req.params;

      // Get the appointment
      const appointment = await AppointmentCrud.getById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          error: {
            message: 'Appointment not found'
          }
        });
      }

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      const isPatient = appointment.patientId.toString() === req.user.id;
      const isDoctor = appointment.doctorId.toString() === req.user.id;
      
      if (!isAdmin && !isPatient && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access this payment'
          }
        });
      }

      // Get payment by appointment ID
      const payment = await PaymentCrud.getPaymentByAppointmentId(appointmentId);
      
      if (!payment) {
        return res.status(404).json({
          error: {
            message: 'No payment found for this appointment'
          }
        });
      }

      res.status(200).json(payment);
    } catch (error) {
      logger.error('Error in getPaymentByAppointment controller:', error);
      next(error);
    }
  }

  /**
   * Get payments by patient
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPaymentsByPatient(req, res, next) {
    try {
      const { patientId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      // Check permissions
      const isAdmin = req.user.role === 'admin';
      
      // Check if current user is the patient
      let isOwner = false;
      
      if (req.user.role === 'patient') {
        const patient = await PatientCrud.getPatientByUserId(req.user.id);
        isOwner = patient && patient._id.toString() === patientId;
      }
      
      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to access these payments'
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

      // Get payments
      const payments = await PaymentCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      });

      // Count total payments for pagination
      const total = await PaymentCrud.count(filter);

      // Get appointment details for each payment
      const paymentsWithDetails = await paymentService.getPaymentsWithAppointmentDetails(payments);

      res.status(200).json({
        payments: paymentsWithDetails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getPaymentsByPatient controller:', error);
      next(error);
    }
  }

  /**
   * Get payments by date range (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPaymentsByDateRange(req, res, next) {
    try {
      const { startDate, endDate, status, page = 1, limit = 10 } = req.query;

      // Only admins can access all payments
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Only administrators can access all payments'
          }
        });
      }

      // Validate date parameters
      if (!startDate || !endDate || isNaN(new Date(startDate).getTime()) || isNaN(new Date(endDate).getTime())) {
        return res.status(400).json({
          error: {
            message: 'Valid startDate and endDate parameters are required'
          }
        });
      }

      // Parse dates
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Build filter
      const filter = {
        transactionDate: {
          $gte: start,
          $lte: end
        }
      };
      
      if (status) {
        filter.status = status;
      }

      // Calculate skip for pagination
      const skip = (page - 1) * parseInt(limit);

      // Get payments
      const payments = await PaymentCrud.find(filter, {
        skip,
        limit: parseInt(limit),
        sort: { transactionDate: -1 }
      });

      // Count total payments for pagination
      const total = await PaymentCrud.count(filter);

      // Get details for each payment
      const paymentsWithDetails = await paymentService.getPaymentsWithDetails(payments);

      res.status(200).json({
        payments: paymentsWithDetails,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      logger.error('Error in getPaymentsByDateRange controller:', error);
      next(error);
    }
  }

  /**
   * Update payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updatePayment(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Only admins can update payment records directly
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Only administrators can update payment records'
          }
        });
      }

      // Update payment
      const updated = await PaymentCrud.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          error: {
            message: 'Payment not found'
          }
        });
      }

      res.status(200).json({
        message: 'Payment updated successfully'
      });
    } catch (error) {
      logger.error('Error in updatePayment controller:', error);
      next(error);
    }
  }

  /**
   * Process payment
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async processPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { paymentMethod, transactionDetails } = req.body;

      // Get the payment
      const payment = await PaymentCrud.getById(id);
      
      if (!payment) {
        return res.status(404).json({
          error: {
            message: 'Payment not found'
          }
        });
      }

      // Check permissions - patient, doctor of the appointment, or admin
      const isAdmin = req.user.role === 'admin';
      const isPatient = payment.patientId.toString() === req.user.id;
      
      let isDoctor = false;
      if (req.user.role === 'doctor') {
        const appointment = await AppointmentCrud.getById(payment.appointmentId);
        isDoctor = appointment && appointment.doctorId.toString() === req.user.id;
      }
      
      if (!isAdmin && !isPatient && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to process this payment'
          }
        });
      }

      // Payment already processed
      if (payment.status === 'completed') {
        return res.status(400).json({
          error: {
            message: 'Payment has already been processed'
          }
        });
      }

      // Payment failed
      if (payment.status === 'failed') {
        return res.status(400).json({
          error: {
            message: 'Payment has been marked as failed and cannot be processed'
          }
        });
      }

      // Update payment method if provided
      if (paymentMethod) {
        payment.paymentMethod = paymentMethod;
        await PaymentCrud.update(id, { paymentMethod });
      }

      // Process payment
      const processed = await paymentService.processPayment(id, transactionDetails);

      if (!processed) {
        return res.status(500).json({
          error: {
            message: 'Failed to process payment'
          }
        });
      }

      res.status(200).json({
        message: 'Payment processed successfully'
      });
    } catch (error) {
      logger.error('Error in processPayment controller:', error);
      next(error);
    }
  }

  /**
   * Mark payment as failed
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async markPaymentAsFailed(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      // Get the payment
      const payment = await PaymentCrud.getById(id);
      
      if (!payment) {
        return res.status(404).json({
          error: {
            message: 'Payment not found'
          }
        });
      }

      // Check permissions - only admin or doctor
      const isAdmin = req.user.role === 'admin';
      
      let isDoctor = false;
      if (req.user.role === 'doctor') {
        const appointment = await AppointmentCrud.getById(payment.appointmentId);
        isDoctor = appointment && appointment.doctorId.toString() === req.user.id;
      }
      
      if (!isAdmin && !isDoctor) {
        return res.status(403).json({
          error: {
            message: 'Unauthorized to mark payment as failed'
          }
        });
      }

      // Payment already processed
      if (payment.status === 'completed') {
        return res.status(400).json({
          error: {
            message: 'Cannot mark a completed payment as failed'
          }
        });
      }

      // Mark as failed
      const marked = await PaymentCrud.markAsFailed(id, reason || 'Payment processing failed');

      if (!marked) {
        return res.status(500).json({
          error: {
            message: 'Failed to mark payment as failed'
          }
        });
      }

      res.status(200).json({
        message: 'Payment marked as failed'
      });
    } catch (error) {
      logger.error('Error in markPaymentAsFailed controller:', error);
      next(error);
    }
  }

  /**
   * Delete payment (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deletePayment(req, res, next) {
    try {
      const { id } = req.params;

      // Only admins can delete payments
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Only administrators can delete payments'
          }
        });
      }

      // Delete payment
      const deleted = await PaymentCrud.delete(id);

      if (!deleted) {
        return res.status(404).json({
          error: {
            message: 'Payment not found'
          }
        });
      }

      res.status(200).json({
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deletePayment controller:', error);
      next(error);
    }
  }

  /**
   * Get payment statistics (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getPaymentStatistics(req, res, next) {
    try {
      const { period } = req.query;

      // Only admins can access payment statistics
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: {
            message: 'Only administrators can access payment statistics'
          }
        });
      }

      // Get payment statistics
      const statistics = await paymentService.generatePaymentStatistics(period);

      res.status(200).json(statistics);
    } catch (error) {
      logger.error('Error in getPaymentStatistics controller:', error);
      next(error);
    }
  }
}

module.exports = new PaymentController();