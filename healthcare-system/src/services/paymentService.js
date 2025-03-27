const Payment = require('../models/Payment');
const User = require('../models/User');
const logger = require('../utils/logger');

class PaymentService {
    /**
     * Create a new payment
     * @param {Object} paymentData - Payment data
     * @returns {Promise<Object>} Created payment
     */
    async createPayment(paymentData) {
        try {
            // Check if patient exists and is active
            const patient = await User.findOne({
                _id: paymentData.patient,
                role: 'patient',
                isActive: true
            });

            if (!patient) {
                throw new Error('Patient not found or not active');
            }

            const payment = await Payment.create(paymentData);
            return payment;
        } catch (error) {
            logger.logError('Error creating payment:', error);
            throw error;
        }
    }

    /**
     * Get payment by ID
     * @param {string} paymentId - Payment ID
     * @returns {Promise<Object>} Payment object
     */
    async getPaymentById(paymentId) {
        try {
            const payment = await Payment.findById(paymentId)
                .populate('patient', 'firstName lastName email phone');

            if (!payment) {
                throw new Error('Payment not found');
            }
            return payment;
        } catch (error) {
            logger.logError('Error getting payment by ID:', error);
            throw error;
        }
    }

    /**
     * Get payments with pagination
     * @param {Object} query - Query parameters
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Paginated payments
     */
    async getPayments(query = {}, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;
            const [payments, total] = await Promise.all([
                Payment.find(query)
                    .populate('patient', 'firstName lastName email phone')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                Payment.countDocuments(query)
            ]);

            return {
                payments,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.logError('Error getting payments:', error);
            throw error;
        }
    }

    /**
     * Update payment
     * @param {string} paymentId - Payment ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated payment
     */
    async updatePayment(paymentId, updateData) {
        try {
            const payment = await Payment.findByIdAndUpdate(
                paymentId,
                { $set: updateData },
                { new: true, runValidators: true }
            )
            .populate('patient', 'firstName lastName email phone');

            if (!payment) {
                throw new Error('Payment not found');
            }
            return payment;
        } catch (error) {
            logger.logError('Error updating payment:', error);
            throw error;
        }
    }

    /**
     * Complete payment
     * @param {string} paymentId - Payment ID
     * @param {string} transactionId - Transaction ID
     * @returns {Promise<Object>} Updated payment
     */
    async completePayment(paymentId, transactionId) {
        try {
            return this.updatePayment(paymentId, {
                status: 'completed',
                transactionId,
                completedAt: new Date()
            });
        } catch (error) {
            logger.logError('Error completing payment:', error);
            throw error;
        }
    }

    /**
     * Fail payment
     * @param {string} paymentId - Payment ID
     * @param {string} reason - Failure reason
     * @returns {Promise<Object>} Updated payment
     */
    async failPayment(paymentId, reason) {
        try {
            return this.updatePayment(paymentId, {
                status: 'failed',
                failureReason: reason,
                failedAt: new Date()
            });
        } catch (error) {
            logger.logError('Error failing payment:', error);
            throw error;
        }
    }

    /**
     * Process refund
     * @param {string} paymentId - Payment ID
     * @param {Object} refundData - Refund data
     * @returns {Promise<Object>} Updated payment
     */
    async processRefund(paymentId, refundData) {
        try {
            const payment = await Payment.findById(paymentId);
            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status !== 'completed') {
                throw new Error('Payment must be completed before refund');
            }

            const refundAmount = refundData.amount || payment.amount;
            if (refundAmount > payment.amount) {
                throw new Error('Refund amount cannot exceed payment amount');
            }

            payment.refundHistory.push({
                ...refundData,
                amount: refundAmount,
                processedAt: new Date()
            });

            if (refundAmount === payment.amount) {
                payment.status = 'refunded';
            } else {
                payment.status = 'partially_refunded';
            }

            await payment.save();
            return payment;
        } catch (error) {
            logger.logError('Error processing refund:', error);
            throw error;
        }
    }

    /**
     * Get patient's payments
     * @param {string} patientId - Patient ID
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Patient's payments
     */
    async getPatientPayments(patientId, filters = {}) {
        try {
            return await Payment.find({
                patient: patientId,
                ...filters
            })
            .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error getting patient payments:', error);
            throw error;
        }
    }

    /**
     * Get payment statistics
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Payment statistics
     */
    async getPaymentStats(filters = {}) {
        try {
            const [
                total,
                completed,
                failed,
                refunded,
                pending
            ] = await Promise.all([
                Payment.countDocuments(filters),
                Payment.countDocuments({ ...filters, status: 'completed' }),
                Payment.countDocuments({ ...filters, status: 'failed' }),
                Payment.countDocuments({ ...filters, status: 'refunded' }),
                Payment.countDocuments({ ...filters, status: 'pending' })
            ]);

            const totalAmount = await Payment.aggregate([
                { $match: filters },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            return {
                total,
                completed,
                failed,
                refunded,
                pending,
                totalAmount: totalAmount[0]?.total || 0,
                completionRate: total ? (completed / total) * 100 : 0,
                failureRate: total ? (failed / total) * 100 : 0,
                refundRate: total ? (refunded / total) * 100 : 0
            };
        } catch (error) {
            logger.logError('Error getting payment statistics:', error);
            throw error;
        }
    }

    /**
     * Get payments by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} filters - Additional filters
     * @returns {Promise<Array>} Payments in date range
     */
    async getPaymentsByDateRange(startDate, endDate, filters = {}) {
        try {
            return await Payment.find({
                createdAt: { $gte: startDate, $lte: endDate },
                ...filters
            })
            .populate('patient', 'firstName lastName email phone')
            .sort({ createdAt: -1 });
        } catch (error) {
            logger.logError('Error getting payments by date range:', error);
            throw error;
        }
    }

    /**
     * Generate payment receipt
     * @param {string} paymentId - Payment ID
     * @returns {Promise<Object>} Payment receipt
     */
    async generateReceipt(paymentId) {
        try {
            const payment = await Payment.findById(paymentId)
                .populate('patient', 'firstName lastName email phone');

            if (!payment) {
                throw new Error('Payment not found');
            }

            const receipt = {
                receiptId: `RCP-${payment._id}`,
                paymentId: payment._id,
                patient: {
                    name: `${payment.patient.firstName} ${payment.patient.lastName}`,
                    email: payment.patient.email,
                    phone: payment.patient.phone
                },
                amount: payment.amount,
                status: payment.status,
                method: payment.method,
                date: payment.createdAt,
                items: payment.items,
                transactionId: payment.transactionId,
                refundHistory: payment.refundHistory
            };

            return receipt;
        } catch (error) {
            logger.logError('Error generating receipt:', error);
            throw error;
        }
    }
}

module.exports = new PaymentService();
