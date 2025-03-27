const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validation');

/**
 * @route   POST /api/payments
 * @desc    Create a new payment
 * @access  Private
 */
router.post('/', 
    authMiddleware.verifyToken, 
    validationMiddleware.validatePayment, 
    paymentController.createPayment
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', authMiddleware.verifyToken, paymentController.getPaymentById);

/**
 * @route   GET /api/payments
 * @desc    Get all payments for current user
 * @access  Private
 */
router.get('/', authMiddleware.verifyToken, paymentController.getUserPayments);

/**
 * @route   POST /api/payments/webhook
 * @desc    Process payment (webhook endpoint for payment gateway callbacks)
 * @access  Public
 */
router.post('/webhook', paymentController.handlePaymentWebhook);

/**
 * @route   POST /api/payments/invoice
 * @desc    Generate invoice
 * @access  Private
 */
router.post('/invoice', authMiddleware.verifyToken, paymentController.generateInvoice);

/**
 * @route   GET /api/payments/invoice/:id
 * @desc    Get invoice by ID
 * @access  Private
 */
router.get('/invoice/:id', authMiddleware.verifyToken, paymentController.getInvoiceById);

/**
 * @route   POST /api/payments/methods
 * @desc    Add payment method
 * @access  Private
 */
router.post('/methods', 
    authMiddleware.verifyToken, 
    validationMiddleware.validatePaymentMethod, 
    paymentController.addPaymentMethod
);

/**
 * @route   GET /api/payments/methods
 * @desc    Get payment methods
 * @access  Private
 */
router.get('/methods', authMiddleware.verifyToken, paymentController.getPaymentMethods);

/**
 * @route   DELETE /api/payments/methods/:id
 * @desc    Delete payment method
 * @access  Private
 */
router.delete('/methods/:id', authMiddleware.verifyToken, paymentController.deletePaymentMethod);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Create refund
 * @access  Private
 */
router.post('/:id/refund', 
    authMiddleware.verifyToken, 
    validationMiddleware.validateRefund, 
    paymentController.createRefund
);

module.exports = router;
