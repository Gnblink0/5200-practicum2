const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'appointment_reminder',
            'appointment_confirmation',
            'appointment_cancellation',
            'prescription_ready',
            'payment_received',
            'payment_failed',
            'report_ready',
            'system_alert',
            'message_received'
        ],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'archived'],
        default: 'unread'
    },
    readAt: Date,
    scheduledFor: Date,
    expiresAt: Date,
    actions: [{
        label: String,
        url: String,
        type: String
    }],
    metadata: {
        source: String,
        category: String,
        tags: [String]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
notificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });

// Pre-save middleware to handle scheduled notifications
notificationSchema.pre('save', function(next) {
    if (this.isModified('scheduledFor')) {
        // Here you would implement scheduling logic
        // For example, using a job queue system
    }
    next();
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
    this.status = 'read';
    this.readAt = new Date();
    await this.save();
};

// Method to archive notification
notificationSchema.methods.archive = async function() {
    this.status = 'archived';
    await this.save();
};

// Method to get unread notifications
notificationSchema.statics.getUnreadNotifications = async function(recipientId) {
    return await this.find({
        recipientId,
        status: 'unread',
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

// Method to get recent notifications
notificationSchema.statics.getRecentNotifications = async function(recipientId, limit = 10) {
    return await this.find({
        recipientId,
        status: { $ne: 'archived' },
        expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Method to create appointment reminder
notificationSchema.statics.createAppointmentReminder = async function(appointment) {
    const reminderTime = new Date(appointment.startTime);
    reminderTime.setHours(reminderTime.getHours() - 24); // 24 hours before

    return await this.create({
        recipientId: appointment.patientId,
        type: 'appointment_reminder',
        title: 'Upcoming Appointment Reminder',
        message: `You have an appointment scheduled for ${appointment.startTime.toLocaleString()}`,
        data: {
            appointmentId: appointment._id
        },
        priority: 'high',
        scheduledFor: reminderTime,
        actions: [{
            label: 'View Appointment',
            url: `/appointments/${appointment._id}`,
            type: 'link'
        }]
    });
};

// Method to create payment notification
notificationSchema.statics.createPaymentNotification = async function(payment) {
    return await this.create({
        recipientId: payment.patientId,
        type: payment.status === 'completed' ? 'payment_received' : 'payment_failed',
        title: payment.status === 'completed' ? 'Payment Received' : 'Payment Failed',
        message: payment.status === 'completed' 
            ? `Payment of ${payment.amount} ${payment.currency} has been received`
            : `Payment of ${payment.amount} ${payment.currency} has failed`,
        data: {
            paymentId: payment._id
        },
        priority: payment.status === 'completed' ? 'medium' : 'high',
        actions: [{
            label: 'View Payment',
            url: `/payments/${payment._id}`,
            type: 'link'
        }]
    });
};

// Method to create prescription notification
notificationSchema.statics.createPrescriptionNotification = async function(prescription) {
    return await this.create({
        recipientId: prescription.patientId,
        type: 'prescription_ready',
        title: 'New Prescription Available',
        message: 'A new prescription has been issued for you',
        data: {
            prescriptionId: prescription._id
        },
        priority: 'medium',
        actions: [{
            label: 'View Prescription',
            url: `/prescriptions/${prescription._id}`,
            type: 'link'
        }]
    });
};

// Method to create report notification
notificationSchema.statics.createReportNotification = async function(report) {
    return await this.create({
        recipientId: report.patientId,
        type: 'report_ready',
        title: 'Medical Report Ready',
        message: 'Your medical report is ready for viewing',
        data: {
            reportId: report._id
        },
        priority: 'medium',
        actions: [{
            label: 'View Report',
            url: `/reports/${report._id}`,
            type: 'link'
        }]
    });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 