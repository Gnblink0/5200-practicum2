const User = require('../User');
const Appointment = require('../Appointment');
const MedicalRecord = require('../MedicalRecord');
const Prescription = require('../Prescription');
const logger = require('../../utils/logger');

class PatientService {
    /**
     * Get all patients with pagination
     * @param {Object} query - Query parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated patients
     */
    async getPatients(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [patients, total] = await Promise.all([
                User.find({ role: 'patient', ...query })
                    .select('-password')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                User.countDocuments({ role: 'patient', ...query })
            ]);

            return {
                patients,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.logError('Error getting patients:', error);
            throw error;
        }
    }

    /**
     * Get patient by ID
     * @param {string} patientId - Patient ID
     * @returns {Promise<Object>} Patient object
     */
    async getPatientById(patientId) {
        try {
            const patient = await User.findOne({ _id: patientId, role: 'patient' })
                .select('-password');
            
            if (!patient) {
                throw new Error('Patient not found');
            }
            return patient;
        } catch (error) {
            logger.logError('Error getting patient by ID:', error);
            throw error;
        }
    }

    /**
     * Get patient's appointments
     * @param {string} patientId - Patient ID
     * @param {Object} filters - Appointment filters
     * @returns {Promise<Array>} Patient's appointments
     */
    async getPatientAppointments(patientId, filters = {}) {
        try {
            return await Appointment.find({
                patient: patientId,
                ...filters
            })
            .populate('doctor', 'firstName lastName email')
            .sort({ date: -1, time: -1 });
        } catch (error) {
            logger.logError('Error getting patient appointments:', error);
            throw error;
        }
    }

    /**
     * Get patient's medical records
     * @param {string} patientId - Patient ID
     * @param {Object} filters - Medical record filters
     * @returns {Promise<Array>} Patient's medical records
     */
    async getPatientMedicalRecords(patientId, filters = {}) {
        try {
            return await MedicalRecord.find({
                patient: patientId,
                ...filters
            })
            .populate('doctor', 'firstName lastName email')
            .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error getting patient medical records:', error);
            throw error;
        }
    }

    /**
     * Get patient's prescriptions
     * @param {string} patientId - Patient ID
     * @param {Object} filters - Prescription filters
     * @returns {Promise<Array>} Patient's prescriptions
     */
    async getPatientPrescriptions(patientId, filters = {}) {
        try {
            return await Prescription.find({
                patient: patientId,
                ...filters
            })
            .populate('doctor', 'firstName lastName email')
            .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error getting patient prescriptions:', error);
            throw error;
        }
    }

    /**
     * Get patient's active prescriptions
     * @param {string} patientId - Patient ID
     * @returns {Promise<Array>} Patient's active prescriptions
     */
    async getPatientActivePrescriptions(patientId) {
        try {
            return this.getPatientPrescriptions(patientId, { status: 'active' });
        } catch (error) {
            logger.logError('Error getting patient active prescriptions:', error);
            throw error;
        }
    }

    /**
     * Get patient's upcoming appointments
     * @param {string} patientId - Patient ID
     * @returns {Promise<Array>} Patient's upcoming appointments
     */
    async getPatientUpcomingAppointments(patientId) {
        try {
            return await Appointment.find({
                patient: patientId,
                date: { $gte: new Date() },
                status: { $in: ['scheduled', 'confirmed'] }
            })
            .populate('doctor', 'firstName lastName email')
            .sort({ date: 1, time: 1 });
        } catch (error) {
            logger.logError('Error getting patient upcoming appointments:', error);
            throw error;
        }
    }

    /**
     * Get patient's past appointments
     * @param {string} patientId - Patient ID
     * @returns {Promise<Array>} Patient's past appointments
     */
    async getPatientPastAppointments(patientId) {
        try {
            return await Appointment.find({
                patient: patientId,
                date: { $lt: new Date() }
            })
            .populate('doctor', 'firstName lastName email')
            .sort({ date: -1, time: -1 });
        } catch (error) {
            logger.logError('Error getting patient past appointments:', error);
            throw error;
        }
    }

    /**
     * Get patient's medical history
     * @param {string} patientId - Patient ID
     * @returns {Promise<Object>} Patient's medical history
     */
    async getPatientMedicalHistory(patientId) {
        try {
            const [appointments, medicalRecords, prescriptions] = await Promise.all([
                this.getPatientPastAppointments(patientId),
                this.getPatientMedicalRecords(patientId),
                this.getPatientPrescriptions(patientId)
            ]);

            return {
                appointments,
                medicalRecords,
                prescriptions
            };
        } catch (error) {
            logger.logError('Error getting patient medical history:', error);
            throw error;
        }
    }

    /**
     * Update patient's medical information
     * @param {string} patientId - Patient ID
     * @param {Object} medicalInfo - Medical information
     * @returns {Promise<Object>} Updated patient
     */
    async updatePatientMedicalInfo(patientId, medicalInfo) {
        try {
            const allowedFields = [
                'bloodType',
                'allergies',
                'chronicConditions',
                'medications',
                'emergencyContact',
                'insuranceInfo'
            ];

            const updateData = Object.keys(medicalInfo)
                .filter(key => allowedFields.includes(key))
                .reduce((obj, key) => {
                    obj[key] = medicalInfo[key];
                    return obj;
                }, {});

            return await User.findByIdAndUpdate(
                patientId,
                { $set: updateData },
                { new: true, runValidators: true }
            ).select('-password');
        } catch (error) {
            logger.logError('Error updating patient medical info:', error);
            throw error;
        }
    }

    /**
     * Get patient's statistics
     * @param {string} patientId - Patient ID
     * @returns {Promise<Object>} Patient's statistics
     */
    async getPatientStats(patientId) {
        try {
            const [
                totalAppointments,
                completedAppointments,
                totalPrescriptions,
                activePrescriptions,
                totalMedicalRecords
            ] = await Promise.all([
                Appointment.countDocuments({ patient: patientId }),
                Appointment.countDocuments({ patient: patientId, status: 'completed' }),
                Prescription.countDocuments({ patient: patientId }),
                Prescription.countDocuments({ patient: patientId, status: 'active' }),
                MedicalRecord.countDocuments({ patient: patientId })
            ]);

            return {
                totalAppointments,
                completedAppointments,
                totalPrescriptions,
                activePrescriptions,
                totalMedicalRecords,
                completionRate: totalAppointments ? (completedAppointments / totalAppointments) * 100 : 0
            };
        } catch (error) {
            logger.logError('Error getting patient statistics:', error);
            throw error;
        }
    }
}

module.exports = new PatientService();
