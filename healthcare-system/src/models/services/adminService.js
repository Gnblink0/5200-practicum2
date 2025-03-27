const AuditLog = require('../AuditLog');
const Setting = require('../Setting');
const logger = require('../../utils/logger');

/**
 * Get system audit logs
 * @param {string} startDate - Start date for filtering
 * @param {string} endDate - End date for filtering
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Audit logs with pagination
 */
const getSystemAuditLogs = async (startDate, endDate, options = {}) => {
    try {
        const { page = 1, limit = 20 } = options;
        const query = {};

        // Add date range filter if provided
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const [logs, total] = await Promise.all([
            AuditLog.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('userId', 'firstName lastName email'),
            AuditLog.countDocuments(query)
        ]);

        return {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        logger.logError('Error in getSystemAuditLogs service', error);
        throw error;
    }
};

/**
 * Get system configuration
 * @returns {Promise<Object>} System configuration
 */
const getSystemConfiguration = async () => {
    try {
        const settings = await Setting.find({ status: 'active' });
        return settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});
    } catch (error) {
        logger.logError('Error in getSystemConfiguration service', error);
        throw error;
    }
};

/**
 * Update system configuration
 * @param {Object} configData - Configuration data to update
 * @returns {Promise<boolean>} Success status
 */
const updateSystemConfiguration = async (configData) => {
    try {
        const session = await Setting.startSession();
        session.startTransaction();

        try {
            for (const [key, value] of Object.entries(configData)) {
                await Setting.findOneAndUpdate(
                    { key, status: 'active' },
                    { value },
                    { new: true, session }
                );
            }

            await session.commitTransaction();
            return true;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        logger.logError('Error in updateSystemConfiguration service', error);
        throw error;
    }
};

/**
 * Get system statistics
 * @returns {Promise<Object>} System statistics
 */
const getSystemStatistics = async () => {
    try {
        const [
            userStats,
            appointmentStats,
            paymentStats,
            prescriptionStats
        ] = await Promise.all([
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            Appointment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Payment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Prescription.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        return {
            userStats,
            appointmentStats,
            paymentStats,
            prescriptionStats
        };
    } catch (error) {
        logger.logError('Error in getSystemStatistics service', error);
        throw error;
    }
};

/**
 * Get daily statistics
 * @returns {Promise<Object>} Daily statistics
 */
const getDailyStatistics = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            appointments,
            payments,
            prescriptions
        ] = await Promise.all([
            Appointment.countDocuments({
                createdAt: { $gte: today }
            }),
            Payment.countDocuments({
                createdAt: { $gte: today }
            }),
            Prescription.countDocuments({
                createdAt: { $gte: today }
            })
        ]);

        return {
            appointments,
            payments,
            prescriptions
        };
    } catch (error) {
        logger.logError('Error in getDailyStatistics service', error);
        throw error;
    }
};

/**
 * Get monthly statistics
 * @returns {Promise<Object>} Monthly statistics
 */
const getMonthlyStatistics = async () => {
    try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [
            appointments,
            payments,
            prescriptions
        ] = await Promise.all([
            Appointment.countDocuments({
                createdAt: { $gte: startOfMonth }
            }),
            Payment.countDocuments({
                createdAt: { $gte: startOfMonth }
            }),
            Prescription.countDocuments({
                createdAt: { $gte: startOfMonth }
            })
        ]);

        return {
            appointments,
            payments,
            prescriptions
        };
    } catch (error) {
        logger.logError('Error in getMonthlyStatistics service', error);
        throw error;
    }
};

/**
 * Create system backup
 * @returns {Promise<Object>} Backup details
 */
const createSystemBackup = async () => {
    try {
        // Here you would implement the actual backup logic
        // For now, we'll just return a mock response
        return {
            backupId: Date.now().toString(),
            timestamp: new Date().toISOString(),
            status: 'completed'
        };
    } catch (error) {
        logger.logError('Error in createSystemBackup service', error);
        throw error;
    }
};

/**
 * Get system backups
 * @returns {Promise<Array>} List of backups
 */
const getSystemBackups = async () => {
    try {
        // Here you would implement the actual backup listing logic
        // For now, we'll return a mock response
        return [];
    } catch (error) {
        logger.logError('Error in getSystemBackups service', error);
        throw error;
    }
};

/**
 * Restore system from backup
 * @param {string} backupId - Backup ID to restore from
 * @returns {Promise<boolean>} Success status
 */
const restoreSystemBackup = async (backupId) => {
    try {
        // Here you would implement the actual restore logic
        // For now, we'll just return a mock response
        return true;
    } catch (error) {
        logger.logError('Error in restoreSystemBackup service', error);
        throw error;
    }
};

module.exports = {
    getSystemAuditLogs,
    getSystemConfiguration,
    updateSystemConfiguration,
    getSystemStatistics,
    getDailyStatistics,
    getMonthlyStatistics,
    createSystemBackup,
    getSystemBackups,
    restoreSystemBackup
};
