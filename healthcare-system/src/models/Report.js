const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['medical', 'billing', 'analytics', 'audit'],
        required: true
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    content: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    format: {
        type: String,
        enum: ['pdf', 'csv', 'json', 'html'],
        default: 'pdf'
    },
    status: {
        type: String,
        enum: ['draft', 'generating', 'completed', 'archived'],
        default: 'draft'
    },
    parameters: {
        startDate: Date,
        endDate: Date,
        filters: mongoose.Schema.Types.Mixed
    },
    metadata: {
        generatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        generatedAt: Date,
        fileSize: Number,
        pageCount: Number
    },
    attachments: [{
        filename: String,
        path: String,
        type: String,
        size: Number
    }],
    access: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        grantedAt: Date,
        expiresAt: Date
    }],
    tags: [String],
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
reportSchema.index({ type: 1, createdAt: -1 });
reportSchema.index({ patientId: 1, createdAt: -1 });
reportSchema.index({ doctorId: 1, createdAt: -1 });
reportSchema.index({ status: 1 });
reportSchema.index({ tags: 1 });

// Pre-save middleware to update lastUpdatedBy
reportSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdatedBy = this._doc.lastUpdatedBy;
    }
    next();
});

// Method to generate report
reportSchema.methods.generateReport = async function() {
    this.status = 'generating';
    await this.save();

    // Here you would implement the actual report generation logic
    // For now, we'll simulate report generation
    this.status = 'completed';
    this.metadata = {
        generatedBy: this.createdBy,
        generatedAt: new Date(),
        fileSize: 1024, // Example size
        pageCount: 1
    };
    await this.save();
};

// Method to grant access
reportSchema.methods.grantAccess = async function(userId, role, expiresAt) {
    this.access.push({
        userId,
        role,
        grantedAt: new Date(),
        expiresAt
    });
    await this.save();
};

// Method to revoke access
reportSchema.methods.revokeAccess = async function(userId) {
    this.access = this.access.filter(acc => acc.userId.toString() !== userId.toString());
    await this.save();
};

// Method to check access
reportSchema.methods.hasAccess = function(userId) {
    const now = new Date();
    return this.access.some(acc => 
        acc.userId.toString() === userId.toString() && 
        (!acc.expiresAt || acc.expiresAt > now)
    );
};

// Method to archive report
reportSchema.methods.archive = async function() {
    this.status = 'archived';
    await this.save();
};

// Method to get report history
reportSchema.methods.getReportHistory = async function() {
    const Report = mongoose.model('Report');
    return await Report.find({ patientId: this.patientId })
        .sort({ createdAt: -1 })
        .populate('doctorId', 'firstName lastName')
        .populate('appointmentId', 'appointmentDate');
};

// Method to add attachment
reportSchema.methods.addAttachment = async function(attachment) {
    this.attachments.push(attachment);
    await this.save();
};

// Method to remove attachment
reportSchema.methods.removeAttachment = async function(filename) {
    this.attachments = this.attachments.filter(att => att.filename !== filename);
    await this.save();
};

// Method to update report content
reportSchema.methods.updateContent = async function(newContent) {
    this.content = newContent;
    this.status = 'draft';
    await this.save();
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report; 