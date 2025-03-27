const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: [
            'create',
            'read',
            'update',
            'delete',
            'login',
            'logout',
            'access_denied',
            'file_upload',
            'file_download',
            'report_generate',
            'prescription_issue',
            'payment_process',
            'appointment_schedule',
            'appointment_cancel',
            'user_register',
            'password_change',
            'role_change',
            'settings_update'
        ],
        required: true
    },
    resource: {
        type: String,
        enum: [
            'user',
            'patient',
            'doctor',
            'appointment',
            'prescription',
            'payment',
            'report',
            'medical_history',
            'notification',
            'system'
        ],
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resource'
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    location: {
        country: String,
        city: String,
        region: String
    },
    status: {
        type: String,
        enum: ['success', 'failure', 'error'],
        default: 'success'
    },
    error: {
        message: String,
        stack: String
    },
    metadata: {
        browser: String,
        os: String,
        device: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ status: 1 });

// Pre-save middleware to enrich metadata
auditLogSchema.pre('save', function(next) {
    if (this.isNew) {
        // Here you would implement IP geolocation and user agent parsing
        // For now, we'll just set basic metadata
        this.metadata = {
            browser: 'Unknown',
            os: 'Unknown',
            device: 'Unknown',
            timestamp: new Date()
        };
    }
    next();
});

// Method to log user action
auditLogSchema.statics.logUserAction = async function(userId, action, resource, resourceId, details = {}) {
    return await this.create({
        userId,
        action,
        resource,
        resourceId,
        details,
        status: 'success'
    });
};

// Method to log error
auditLogSchema.statics.logError = async function(userId, action, resource, resourceId, error) {
    return await this.create({
        userId,
        action,
        resource,
        resourceId,
        status: 'error',
        error: {
            message: error.message,
            stack: error.stack
        }
    });
};

// Method to log access attempt
auditLogSchema.statics.logAccessAttempt = async function(userId, action, status, details = {}) {
    return await this.create({
        userId,
        action,
        resource: 'system',
        status,
        details
    });
};

// Method to get user activity history
auditLogSchema.statics.getUserActivityHistory = async function(userId, limit = 50) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email');
};

// Method to get resource history
auditLogSchema.statics.getResourceHistory = async function(resource, resourceId) {
    return await this.find({ resource, resourceId })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName email');
};

// Method to get failed actions
auditLogSchema.statics.getFailedActions = async function(startDate, endDate) {
    return await this.find({
        status: 'failure',
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email');
};

// Method to get security events
auditLogSchema.statics.getSecurityEvents = async function(startDate, endDate) {
    return await this.find({
        action: { $in: ['login', 'logout', 'access_denied', 'password_change'] },
        createdAt: {
            $gte: startDate,
            $lte: endDate
        }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email');
};

// Method to get audit summary
auditLogSchema.statics.getAuditSummary = async function(startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: {
                    action: '$action',
                    resource: '$resource',
                    status: '$status'
                },
                count: { $sum: 1 }
            }
        }
    ]);
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog; 