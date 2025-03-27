const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('./config');
const logger = require('../utils/logger');

/**
 * Create a payment intent
 * @param {Object} paymentData - Payment data
 * @param {number} paymentData.amount - Amount in cents
 * @param {string} paymentData.currency - Currency code
 * @param {string} paymentData.paymentMethodId - Payment method ID
 * @param {Object} paymentData.metadata - Additional metadata
 * @returns {Promise<Object>} Payment intent
 */
const createPaymentIntent = async (paymentData) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: paymentData.amount,
            currency: paymentData.currency || config.payment.currency,
            payment_method: paymentData.paymentMethodId,
            confirm: true,
            metadata: paymentData.metadata
        });

        logger.logInfo('Payment intent created', {
            paymentIntentId: paymentIntent.id,
            amount: paymentData.amount,
            status: paymentIntent.status
        });

        return paymentIntent;
    } catch (error) {
        logger.logError('Error creating payment intent', { error });
        throw error;
    }
};

/**
 * Create a payment method
 * @param {Object} paymentMethodData - Payment method data
 * @param {string} paymentMethodData.type - Payment method type
 * @param {Object} paymentMethodData.card - Card details
 * @param {Object} paymentMethodData.billingDetails - Billing details
 * @returns {Promise<Object>} Payment method
 */
const createPaymentMethod = async (paymentMethodData) => {
    try {
        const paymentMethod = await stripe.paymentMethods.create({
            type: paymentMethodData.type,
            card: paymentMethodData.card,
            billing_details: paymentMethodData.billingDetails
        });

        logger.logInfo('Payment method created', {
            paymentMethodId: paymentMethod.id,
            type: paymentMethod.type
        });

        return paymentMethod;
    } catch (error) {
        logger.logError('Error creating payment method', { error });
        throw error;
    }
};

/**
 * Attach payment method to customer
 * @param {string} customerId - Customer ID
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Attached payment method
 */
const attachPaymentMethod = async (customerId, paymentMethodId) => {
    try {
        const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
            customer: customerId
        });

        logger.logInfo('Payment method attached to customer', {
            customerId,
            paymentMethodId
        });

        return paymentMethod;
    } catch (error) {
        logger.logError('Error attaching payment method', { error });
        throw error;
    }
};

/**
 * Create a customer
 * @param {Object} customerData - Customer data
 * @param {string} customerData.email - Customer email
 * @param {string} customerData.name - Customer name
 * @param {Object} customerData.metadata - Additional metadata
 * @returns {Promise<Object>} Customer
 */
const createCustomer = async (customerData) => {
    try {
        const customer = await stripe.customers.create({
            email: customerData.email,
            name: customerData.name,
            metadata: customerData.metadata
        });

        logger.logInfo('Customer created', {
            customerId: customer.id,
            email: customer.email
        });

        return customer;
    } catch (error) {
        logger.logError('Error creating customer', { error });
        throw error;
    }
};

/**
 * Create a subscription
 * @param {Object} subscriptionData - Subscription data
 * @param {string} subscriptionData.customerId - Customer ID
 * @param {string} subscriptionData.priceId - Price ID
 * @param {Object} subscriptionData.metadata - Additional metadata
 * @returns {Promise<Object>} Subscription
 */
const createSubscription = async (subscriptionData) => {
    try {
        const subscription = await stripe.subscriptions.create({
            customer: subscriptionData.customerId,
            items: [{ price: subscriptionData.priceId }],
            metadata: subscriptionData.metadata
        });

        logger.logInfo('Subscription created', {
            subscriptionId: subscription.id,
            customerId: subscriptionData.customerId
        });

        return subscription;
    } catch (error) {
        logger.logError('Error creating subscription', { error });
        throw error;
    }
};

/**
 * Create a refund
 * @param {Object} refundData - Refund data
 * @param {string} refundData.paymentIntentId - Payment intent ID
 * @param {number} refundData.amount - Amount to refund in cents
 * @param {string} refundData.reason - Refund reason
 * @returns {Promise<Object>} Refund
 */
const createRefund = async (refundData) => {
    try {
        const refund = await stripe.refunds.create({
            payment_intent: refundData.paymentIntentId,
            amount: refundData.amount,
            reason: refundData.reason
        });

        logger.logInfo('Refund created', {
            refundId: refund.id,
            paymentIntentId: refundData.paymentIntentId
        });

        return refund;
    } catch (error) {
        logger.logError('Error creating refund', { error });
        throw error;
    }
};

/**
 * Get payment intent
 * @param {string} paymentIntentId - Payment intent ID
 * @returns {Promise<Object>} Payment intent
 */
const getPaymentIntent = async (paymentIntentId) => {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent;
    } catch (error) {
        logger.logError('Error retrieving payment intent', { error });
        throw error;
    }
};

/**
 * Get customer
 * @param {string} customerId - Customer ID
 * @returns {Promise<Object>} Customer
 */
const getCustomer = async (customerId) => {
    try {
        const customer = await stripe.customers.retrieve(customerId);
        return customer;
    } catch (error) {
        logger.logError('Error retrieving customer', { error });
        throw error;
    }
};

/**
 * Get subscription
 * @param {string} subscriptionId - Subscription ID
 * @returns {Promise<Object>} Subscription
 */
const getSubscription = async (subscriptionId) => {
    try {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        return subscription;
    } catch (error) {
        logger.logError('Error retrieving subscription', { error });
        throw error;
    }
};

/**
 * Get refund
 * @param {string} refundId - Refund ID
 * @returns {Promise<Object>} Refund
 */
const getRefund = async (refundId) => {
    try {
        const refund = await stripe.refunds.retrieve(refundId);
        return refund;
    } catch (error) {
        logger.logError('Error retrieving refund', { error });
        throw error;
    }
};

/**
 * Verify webhook signature
 * @param {string} payload - Webhook payload
 * @param {string} signature - Webhook signature
 * @returns {Promise<Object>} Webhook event
 */
const verifyWebhook = (payload, signature) => {
    try {
        const event = stripe.webhooks.constructEvent(
            payload,
            signature,
            config.payment.stripe.webhookSecret
        );
        return event;
    } catch (error) {
        logger.logError('Error verifying webhook', { error });
        throw error;
    }
};

module.exports = {
    stripe,
    createPaymentIntent,
    createPaymentMethod,
    attachPaymentMethod,
    createCustomer,
    createSubscription,
    createRefund,
    getPaymentIntent,
    getCustomer,
    getSubscription,
    getRefund,
    verifyWebhook
}; 