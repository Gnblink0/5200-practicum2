const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    personalInfo: {
        title: String,
        department: String,
        officeLocation: String,
        phoneExtension: String,
        emergencyContact: {
            name: String,
            relationship: String,
            phone: String
        }
    },
    permissions: [{
        type: String,
        enum: [
            'user_management',
            'system_configuration',
            'reporting',
            'billing_management',
            'audit_logs',
            'medical_record_review'
        ]
    }],
    activityLog: [{
        action: {
            type: String,
            required: true
        },
        details: {
            type: mongoose.Schema.Types.Mixed
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    lastLogin: Date,
    lastActivity: Date,
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String,
        tags: [String]
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
adminSchema.index({ userId: 1 });
adminSchema.index({ status: 1 });
adminSchema.index({ 'activityLog.timestamp': -1 });

// Pre-save middleware to update lastUpdatedBy
adminSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.metadata.lastUpdatedBy = this._doc.metadata?.lastUpdatedBy;
    }
    next();
});

/**
 * Get admin by user ID
 */
adminSchema.statics.getAdminByUserId = async function(userId) {
    return this.findOne({ userId });
};

/**
 * Add activity log entry
 */
adminSchema.methods.addActivityLogEntry = async function(action, details, userId) {
    this.activityLog.push({
        action,
        details,
        userId,
        timestamp: new Date()
    });
    this.lastActivity = new Date();
    await this.save();
};

/**
 * Update permissions
 */
adminSchema.methods.updatePermissions = async function(permissions) {
    this.permissions = permissions;
    await this.save();
};

/**
 * Get recent activity
 */
adminSchema.methods.getRecentActivity = function(limit = 10) {
    return this.activityLog
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
};

/**
 * Check if admin has specific permission
 */
adminSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

/**
 * Check if admin has any of the specified permissions
 */
adminSchema.methods.hasAnyPermission = function(permissions) {
    return permissions.some(permission => this.permissions.includes(permission));
};

/**
 * Check if admin has all of the specified permissions
 */
adminSchema.methods.hasAllPermissions = function(permissions) {
    return permissions.every(permission => this.permissions.includes(permission));
};

/**
 * Update status
 */
adminSchema.methods.updateStatus = async function(status) {
    this.status = status;
    await this.save();
};

/**
 * Update last login
 */
adminSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

/**
 * Get activity summary
 */
adminSchema.methods.getActivitySummary = function(startDate, endDate) {
    return this.activityLog
        .filter(log => {
            const timestamp = new Date(log.timestamp);
            return timestamp >= startDate && timestamp <= endDate;
        })
        .reduce((summary, log) => {
            summary[log.action] = (summary[log.action] || 0) + 1;
            return summary;
        }, {});
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin; 