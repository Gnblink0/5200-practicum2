const nodemailer = require('nodemailer');
const config = require('./config');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

// Create email transporter
const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    }
});

/**
 * Load email template
 * @param {string} templateName - Name of the template file
 * @returns {Promise<string>} Template content
 */
const loadTemplate = async (templateName) => {
    try {
        const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
        return await fs.readFile(templatePath, 'utf8');
    } catch (error) {
        logger.logError('Error loading email template', { templateName, error });
        throw error;
    }
};

/**
 * Replace template variables
 * @param {string} template - Email template
 * @param {Object} variables - Variables to replace
 * @returns {string} Processed template
 */
const replaceVariables = (template, variables) => {
    let processedTemplate = template;
    for (const [key, value] of Object.entries(variables)) {
        processedTemplate = processedTemplate.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return processedTemplate;
};

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {Object} options.variables - Template variables
 * @param {Array} options.attachments - Email attachments
 * @returns {Promise<Object>} Send result
 */
const sendEmail = async ({ to, subject, template, variables = {}, attachments = [] }) => {
    try {
        // Load and process template
        let html = await loadTemplate(template);
        html = replaceVariables(html, variables);

        // Prepare email options
        const mailOptions = {
            from: config.email.from,
            to,
            subject,
            html,
            attachments
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        
        logger.logInfo('Email sent successfully', {
            to,
            subject,
            messageId: info.messageId
        });

        return info;
    } catch (error) {
        logger.logError('Error sending email', { to, subject, error });
        throw error;
    }
};

/**
 * Send welcome email
 * @param {Object} user - User object
 * @returns {Promise<void>}
 */
const sendWelcomeEmail = async (user) => {
    try {
        await sendEmail({
            to: user.email,
            subject: 'Welcome to Healthcare System',
            template: 'welcome',
            variables: {
                name: user.firstName,
                email: user.email,
                loginUrl: `${config.server.baseUrl}/login`
            }
        });
    } catch (error) {
        logger.logError('Error sending welcome email', { userId: user._id, error });
        throw error;
    }
};

/**
 * Send appointment confirmation email
 * @param {Object} appointment - Appointment object
 * @param {Object} patient - Patient object
 * @returns {Promise<void>}
 */
const sendAppointmentConfirmation = async (appointment, patient) => {
    try {
        await sendEmail({
            to: patient.email,
            subject: 'Appointment Confirmation',
            template: 'appointment',
            variables: {
                name: patient.firstName,
                date: appointment.date.toLocaleDateString(),
                time: appointment.time,
                doctor: appointment.doctorName,
                location: appointment.location,
                cancelUrl: `${config.server.baseUrl}/appointments/${appointment._id}/cancel`
            }
        });
    } catch (error) {
        logger.logError('Error sending appointment confirmation', { 
            appointmentId: appointment._id, 
            patientId: patient._id, 
            error 
        });
        throw error;
    }
};

/**
 * Send prescription notification email
 * @param {Object} prescription - Prescription object
 * @param {Object} patient - Patient object
 * @returns {Promise<void>}
 */
const sendPrescriptionNotification = async (prescription, patient) => {
    try {
        await sendEmail({
            to: patient.email,
            subject: 'New Prescription Available',
            template: 'prescription',
            variables: {
                name: patient.firstName,
                doctor: prescription.doctorName,
                date: prescription.date.toLocaleDateString(),
                viewUrl: `${config.server.baseUrl}/prescriptions/${prescription._id}`
            }
        });
    } catch (error) {
        logger.logError('Error sending prescription notification', { 
            prescriptionId: prescription._id, 
            patientId: patient._id, 
            error 
        });
        throw error;
    }
};

/**
 * Send payment confirmation email
 * @param {Object} payment - Payment object
 * @param {Object} patient - Patient object
 * @returns {Promise<void>}
 */
const sendPaymentConfirmation = async (payment, patient) => {
    try {
        await sendEmail({
            to: patient.email,
            subject: 'Payment Confirmation',
            template: 'payment',
            variables: {
                name: patient.firstName,
                amount: payment.amount,
                date: payment.date.toLocaleDateString(),
                transactionId: payment.transactionId,
                receiptUrl: `${config.server.baseUrl}/payments/${payment._id}/receipt`
            }
        });
    } catch (error) {
        logger.logError('Error sending payment confirmation', { 
            paymentId: payment._id, 
            patientId: patient._id, 
            error 
        });
        throw error;
    }
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetToken - Password reset token
 * @returns {Promise<void>}
 */
const sendPasswordReset = async (user, resetToken) => {
    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request',
            template: 'password-reset',
            variables: {
                name: user.firstName,
                resetUrl: `${config.server.baseUrl}/reset-password/${resetToken}`
            }
        });
    } catch (error) {
        logger.logError('Error sending password reset email', { 
            userId: user._id, 
            error 
        });
        throw error;
    }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
const verifyConfig = async () => {
    try {
        await transporter.verify();
        return true;
    } catch (error) {
        logger.logError('Email configuration verification failed', error);
        return false;
    }
};

module.exports = {
    transporter,
    sendEmail,
    sendWelcomeEmail,
    sendAppointmentConfirmation,
    sendPrescriptionNotification,
    sendPaymentConfirmation,
    sendPasswordReset,
    verifyConfig
}; 