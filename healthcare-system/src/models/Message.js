const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['text', 'system', 'notification', 'alert'],
        default: 'text'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['draft', 'sent', 'delivered', 'read', 'archived', 'deleted'],
        default: 'draft'
    },
    relatedTo: {
        model: {
            type: String,
            enum: [
                'Appointment',
                'Prescription',
                'Payment',
                'Report',
                'MedicalHistory'
            ]
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedTo.model'
        }
    },
    attachments: [{
        filename: String,
        path: String,
        type: String,
        size: Number
    }],
    metadata: {
        readAt: Date,
        deliveredAt: Date,
        sentAt: Date,
        tags: [String],
        category: String
    },
    threadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    isReply: {
        type: Boolean,
        default: false
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
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
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, createdAt: -1 });
messageSchema.index({ threadId: 1, createdAt: -1 });
messageSchema.index({ status: 1 });
messageSchema.index({ type: 1 });

// Pre-save middleware to update lastUpdatedBy
messageSchema.pre('save', function(next) {
    if (this.isModified()) {
        this.lastUpdatedBy = this._doc.lastUpdatedBy;
    }
    next();
});

// Method to send message
messageSchema.methods.send = async function() {
    this.status = 'sent';
    this.metadata.sentAt = new Date();
    await this.save();

    // Create notification for recipient
    const Notification = mongoose.model('Notification');
    await Notification.create({
        recipientId: this.recipientId,
        type: 'message_received',
        title: 'New Message',
        message: `You have received a new message from ${this.senderId}`,
        data: {
            messageId: this._id
        },
        priority: this.priority,
        actions: [{
            label: 'View Message',
            url: `/messages/${this._id}`,
            type: 'link'
        }]
    });
};

// Method to mark as read
messageSchema.methods.markAsRead = async function() {
    this.status = 'read';
    this.metadata.readAt = new Date();
    await this.save();
};

// Method to archive message
messageSchema.methods.archive = async function() {
    this.status = 'archived';
    await this.save();
};

// Method to delete message
messageSchema.methods.delete = async function() {
    this.status = 'deleted';
    await this.save();
};

// Method to get message thread
messageSchema.methods.getThread = async function() {
    const Message = mongoose.model('Message');
    return await Message.find({
        $or: [
            { _id: this.threadId },
            { threadId: this.threadId }
        ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'firstName lastName email')
    .populate('recipientId', 'firstName lastName email');
};

// Method to get unread messages
messageSchema.statics.getUnreadMessages = async function(userId) {
    return await this.find({
        recipientId: userId,
        status: { $in: ['sent', 'delivered'] }
    })
    .sort({ createdAt: -1 })
    .populate('senderId', 'firstName lastName email');
};

// Method to get message history
messageSchema.statics.getMessageHistory = async function(userId, otherUserId) {
    return await this.find({
        $or: [
            { senderId: userId, recipientId: otherUserId },
            { senderId: otherUserId, recipientId: userId }
        ]
    })
    .sort({ createdAt: -1 })
    .populate('senderId', 'firstName lastName email')
    .populate('recipientId', 'firstName lastName email');
};

// Method to get inbox
messageSchema.statics.getInbox = async function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await this.find({
        recipientId: userId,
        status: { $ne: 'deleted' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderId', 'firstName lastName email');
};

// Method to get sent messages
messageSchema.statics.getSentMessages = async function(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return await this.find({
        senderId: userId,
        status: { $ne: 'deleted' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('recipientId', 'firstName lastName email');
};

// Method to get message statistics
messageSchema.statics.getMessageStatistics = async function(userId) {
    return await this.aggregate([
        {
            $match: {
                $or: [
                    { senderId: mongoose.Types.ObjectId(userId) },
                    { recipientId: mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 