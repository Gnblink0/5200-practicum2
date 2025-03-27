const Prescription = require('../models/Prescription');
const User = require('../models/User');
const logger = require('../utils/logger');

class PrescriptionService {
    /**
     * Create a new prescription
     * @param {Object} prescriptionData - Prescription data
     * @returns {Promise<Object>} Created prescription
     */
    async createPrescription(prescriptionData) {
        try {
            // Check if doctor exists and is active
            const doctor = await User.findOne({
                _id: prescriptionData.doctor,
                role: 'doctor',
                isActive: true
            });

            if (!doctor) {
                throw new Error('Doctor not found or not active');
            }

            // Check if patient exists and is active
            const patient = await User.findOne({
                _id: prescriptionData.patient,
                role: 'patient',
                isActive: true
            });

            if (!patient) {
                throw new Error('Patient not found or not active');
            }

            const prescription = await Prescription.create(prescriptionData);
            return prescription;
        } catch (error) {
            logger.logError('Error creating prescription:', error);
            throw error;
        }
    }

    /**
     * Get prescription by ID
     * @param {string} prescriptionId - Prescription ID
     * @returns {Promise<Object>} Prescription object
     */
    async getPrescriptionById(prescriptionId) {
        try {
            const prescription = await Prescription.findById(prescriptionId)
                .populate('doctor', 'firstName lastName email phone')
                .populate('patient', 'firstName lastName email phone');

            if (!prescription) {
                throw new Error('Prescription not found');
            }
            return prescription;
        } catch (error) {
            logger.logError('Error getting prescription by ID:', error);
            throw error;
        }
    }

    /**
     * Get prescriptions with pagination
     * @param {Object} query - Query parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated prescriptions
     */
    async getPrescriptions(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [prescriptions, total] = await Promise.all([
                Prescription.find(query)
                    .populate('doctor', 'firstName lastName email phone')
                    .populate('patient', 'firstName lastName email phone')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                Prescription.countDocuments(query)
            ]);

            return {
                prescriptions,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.logError('Error getting prescriptions:', error);
            throw error;
        }
    }

    /**
     * Update prescription
     * @param {string} prescriptionId - Prescription ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated prescription
     */
    async updatePrescription(prescriptionId, updateData) {
        try {
            const prescription = await Prescription.findByIdAndUpdate(
                prescriptionId,
                { $set: updateData },
                { new: true, runValidators: true }
            )
            .populate('doctor', 'firstName lastName email phone')
            .populate('patient', 'firstName lastName email phone');

            if (!prescription) {
                throw new Error('Prescription not found');
            }
            return prescription;
        } catch (error) {
            logger.logError('Error updating prescription:', error);
            throw error;
        }
    }

    /**
     * Complete prescription
     * @param {string} prescriptionId - Prescription ID
     * @returns {Promise<Object>} Updated prescription
     */
    async completePrescription(prescriptionId) {
        try {
            return this.updatePrescription(prescriptionId, {
                status: 'completed',
                completedAt: new Date()
            });
        } catch (error) {
            logger.logError('Error completing prescription:', error);
            throw error;
        }
    }

    /**
     * Cancel prescription
     * @param {string} prescriptionId - Prescription ID
     * @param {string} reason - Cancellation reason
     * @returns {Promise<Object>} Updated prescription
     */
    async cancelPrescription(prescriptionId, reason) {
        try {
            return this.updatePrescription(prescriptionId, {
                status: 'cancelled',
                cancellationReason: reason,
                cancelledAt: new Date()
            });
        } catch (error) {
            logger.logError('Error cancelling prescription:', error);
            throw error;
        }
    }

    /**
     * Add refill to prescription
     * @param {string} prescriptionId - Prescription ID
     * @param {Object} refillData - Refill data
     * @returns {Promise<Object>} Updated prescription
     */
    async addRefill(prescriptionId, refillData) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                throw new Error('Prescription not found');
            }

            if (prescription.refillRemaining <= 0) {
                throw new Error('No refills remaining');
            }

            prescription.refillHistory.push({
                ...refillData,
                date: new Date()
            });
            prescription.refillRemaining--;
            await prescription.save();

            return prescription;
        } catch (error) {
            logger.logError('Error adding refill:', error);
            throw error;
        }
    }

    /**
     * Report side effects
     * @param {string} prescriptionId - Prescription ID
     * @param {Object} sideEffectData - Side effect data
     * @returns {Promise<Object>} Updated prescription
     */
    async reportSideEffects(prescriptionId, sideEffectData) {
        try {
            const prescription = await Prescription.findById(prescriptionId);
            if (!prescription) {
                throw new Error('Prescription not found');
            }

            prescription.sideEffects.push({
                ...sideEffectData,
                reportedAt: new Date()
            });
            await prescription.save();

            return prescription;
        } catch (error) {
            logger.logError('Error reporting side effects:', error);
            throw error;
        }
    }

    /**
     * Get active prescriptions
     * @param {string} patientId - Patient ID
     * @returns {Promise<Array>} Active prescriptions
     */
    async getActivePrescriptions(patientId) {
        try {
            return await Prescription.find({
                patient: patientId,
                status: 'active',
                'medications.endDate': { $gt: new Date() }
            })
            .populate('doctor', 'firstName lastName email phone')
            .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error getting active prescriptions:', error);
            throw error;
        }
    }

    /**
     * Get prescription statistics
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Prescription statistics
     */
    async getPrescriptionStats(filters = {}) {
        try {
            const [
                total,
                active,
                completed,
                cancelled,
                expired
            ] = await Promise.all([
                Prescription.countDocuments(filters),
                Prescription.countDocuments({
                    ...filters,
                    status: 'active',
                    'medications.endDate': { $gt: new Date() }
                }),
                Prescription.countDocuments({ ...filters, status: 'completed' }),
                Prescription.countDocuments({ ...filters, status: 'cancelled' }),
                Prescription.countDocuments({
                    ...filters,
                    status: 'active',
                    'medications.endDate': { $lte: new Date() }
                })
            ]);

            return {
                total,
                active,
                completed,
                cancelled,
                expired,
                completionRate: total ? (completed / total) * 100 : 0,
                cancellationRate: total ? (cancelled / total) * 100 : 0,
                expirationRate: total ? (expired / total) * 100 : 0
            };
        } catch (error) {
            logger.logError('Error getting prescription statistics:', error);
            throw error;
        }
    }

    /**
     * Get prescriptions by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Prescriptions in date range
     */
    async getPrescriptionsByDateRange(startDate, endDate, filters = {}) {
        try {
            return await Prescription.find({
                createdAt: { $gte: startDate, $lte: endDate },
                ...filters
            })
            .populate('doctor', 'firstName lastName email phone')
            .populate('patient', 'firstName lastName email phone')
            .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error getting prescriptions by date range:', error);
            throw error;
        }
    }
}

module.exports = new PrescriptionService();
