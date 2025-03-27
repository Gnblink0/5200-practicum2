const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: [
            'medical_record',
            'prescription',
            'lab_result',
            'imaging',
            'insurance',
            'consent_form',
            'report',
            'profile_image',
            'document'
        ],
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedTo: {
        model: {
            type: String,
            enum: [
                'User',
                'Appointment',
                'Prescription',
                'MedicalHistory',
                'Report',
                'Payment'
            ]
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedTo.model'
        }
    },
    access: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: String,
        grantedAt: Date,
        expiresAt: Date
    }],
    metadata: {
        description: String,
        tags: [String],
        category: String,
        version: Number,
        checksum: String
    },
    status: {
        type: String,
        enum: ['processing', 'active', 'archived', 'deleted'],
        default: 'processing'
    },
    processing: {
        status: String,
        progress: Number,
        error: String
    },
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
fileSchema.index({ owner: 1, type: 1 });
fileSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ 'metadata.tags': 1 });

// Pre-save middleware to update lastUpdatedBy
fileSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdatedBy = this._doc.lastUpdatedBy;
    }
    next();
});

// Method to grant access
fileSchema.methods.grantAccess = async function(userId, role, expiresAt) {
    this.access.push({
        userId,
        role,
        grantedAt: new Date(),
        expiresAt
    });
    await this.save();
};

// Method to revoke access
fileSchema.methods.revokeAccess = async function(userId) {
    this.access = this.access.filter(acc => acc.userId.toString() !== userId.toString());
    await this.save();
};

// Method to check access
fileSchema.methods.hasAccess = function(userId) {
    const now = new Date();
    return this.access.some(acc => 
        acc.userId.toString() === userId.toString() && 
        (!acc.expiresAt || acc.expiresAt > now)
    );
};

// Method to archive file
fileSchema.methods.archive = async function() {
    this.status = 'archived';
    await this.save();
};

// Method to delete file
fileSchema.methods.delete = async function() {
    this.status = 'deleted';
    await this.save();
};

// Method to get file history
fileSchema.methods.getFileHistory = async function() {
    const AuditLog = mongoose.model('AuditLog');
    return await AuditLog.find({
        resource: 'file',
        resourceId: this._id
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email');
};

// Method to get related files
fileSchema.methods.getRelatedFiles = async function() {
    const File = mongoose.model('File');
    return await File.find({
        'relatedTo.model': this.relatedTo.model,
        'relatedTo.id': this.relatedTo.id,
        status: 'active'
    });
};

// Method to update processing status
fileSchema.methods.updateProcessingStatus = async function(status, progress, error = null) {
    this.processing = {
        status,
        progress,
        error
    };
    if (status === 'completed') {
        this.status = 'active';
    }
    await this.save();
};

// Method to get file statistics
fileSchema.statics.getFileStatistics = async function(startDate, endDate) {
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
                    type: '$type',
                    status: '$status'
                },
                count: { $sum: 1 },
                totalSize: { $sum: '$size' }
            }
        }
    ]);
};

// Method to get storage usage
fileSchema.statics.getStorageUsage = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: '$type',
                totalSize: { $sum: '$size' },
                count: { $sum: 1 }
            }
        }
    ]);
};

const File = mongoose.model('File', fileSchema);

module.exports = File; 