const mongoose = require('mongoose');
const User = require('./User');

const AdminSchema = User.discriminator('Admin', new mongoose.Schema({
    permissions: {
        type: [String],
        enum: [
            'user_management',
            'system_configuration', 
            'reporting',
            'audit_logs',
            'medical_record_review'
        ],
        default: []
    },
    activityLog: [{
        action: {
            type: String,
            required: [true, 'Action is required']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: mongoose.Schema.Types.Mixed,
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        }
    }]
}, {
    timestamps: true
}));

// Method to log admin activity
AdminSchema.methods.logActivity = function(action, details) {
    this.activityLog.push({
        action,
        details,
        performedBy: this._id
    });
    return this.save();
};

// Static method to find admins with specific permissions
AdminSchema.statics.findByPermission = function(permission) {
    return this.find({ permissions: permission });
};

module.exports = mongoose.model('Admin', AdminSchema);