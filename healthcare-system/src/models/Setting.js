const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'json', 'array'],
        required: true
    },
    category: {
        type: String,
        enum: [
            'general',
            'email',
            'sms',
            'payment',
            'security',
            'notification',
            'appointment',
            'file',
            'report',
            'integration'
        ],
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    validation: {
        min: Number,
        max: Number,
        pattern: String,
        enum: [mongoose.Schema.Types.Mixed]
    },
    defaultValue: mongoose.Schema.Types.Mixed,
    metadata: {
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastUpdatedAt: Date,
        version: Number,
        history: [{
            value: mongoose.Schema.Types.Mixed,
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            updatedAt: Date
        }]
    },
    status: {
        type: String,
        enum: ['active', 'deprecated', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
settingSchema.index({ key: 1 }, { unique: true });
settingSchema.index({ category: 1 });
settingSchema.index({ status: 1 });

// Pre-save middleware to handle type validation
settingSchema.pre('save', function(next) {
    if (this.isModified('value')) {
        // Validate value type
        switch (this.type) {
            case 'string':
                if (typeof this.value !== 'string') {
                    throw new Error('Value must be a string');
                }
                break;
            case 'number':
                if (typeof this.value !== 'number') {
                    throw new Error('Value must be a number');
                }
                break;
            case 'boolean':
                if (typeof this.value !== 'boolean') {
                    throw new Error('Value must be a boolean');
                }
                break;
            case 'json':
                try {
                    JSON.stringify(this.value);
                } catch (error) {
                    throw new Error('Value must be valid JSON');
                }
                break;
            case 'array':
                if (!Array.isArray(this.value)) {
                    throw new Error('Value must be an array');
                }
                break;
        }

        // Validate against constraints if defined
        if (this.validation) {
            if (this.validation.min !== undefined && this.value < this.validation.min) {
                throw new Error(`Value must be greater than or equal to ${this.validation.min}`);
            }
            if (this.validation.max !== undefined && this.value > this.validation.max) {
                throw new Error(`Value must be less than or equal to ${this.validation.max}`);
            }
            if (this.validation.pattern && !new RegExp(this.validation.pattern).test(this.value)) {
                throw new Error('Value does not match the required pattern');
            }
            if (this.validation.enum && !this.validation.enum.includes(this.value)) {
                throw new Error('Value must be one of the allowed values');
            }
        }

        // Update metadata
        this.metadata.lastUpdatedAt = new Date();
        this.metadata.version = (this.metadata.version || 0) + 1;
        this.metadata.history.push({
            value: this.value,
            updatedBy: this.metadata.lastUpdatedBy,
            updatedAt: new Date()
        });
    }
    next();
});

// Method to get setting by key
settingSchema.statics.getSetting = async function(key) {
    const setting = await this.findOne({ key, status: 'active' });
    return setting ? setting.value : null;
};

// Method to get settings by category
settingSchema.statics.getSettingsByCategory = async function(category) {
    const settings = await this.find({ category, status: 'active' });
    return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
};

// Method to update setting
settingSchema.statics.updateSetting = async function(key, value, updatedBy) {
    const setting = await this.findOne({ key });
    if (!setting) {
        throw new Error('Setting not found');
    }

    setting.value = value;
    setting.metadata.lastUpdatedBy = updatedBy;
    await setting.save();
    return setting;
};

// Method to get setting history
settingSchema.methods.getHistory = function() {
    return this.metadata.history;
};

// Method to revert to previous version
settingSchema.methods.revertToVersion = async function(version) {
    const historyEntry = this.metadata.history.find(h => h.version === version);
    if (!historyEntry) {
        throw new Error('Version not found in history');
    }

    this.value = historyEntry.value;
    this.metadata.lastUpdatedBy = historyEntry.updatedBy;
    await this.save();
};

// Method to get all public settings
settingSchema.statics.getPublicSettings = async function() {
    const settings = await this.find({ isPublic: true, status: 'active' });
    return settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
    }, {});
};

// Method to validate settings
settingSchema.statics.validateSettings = async function(settings) {
    const errors = [];
    for (const [key, value] of Object.entries(settings)) {
        const setting = await this.findOne({ key });
        if (!setting) {
            errors.push(`Setting "${key}" not found`);
            continue;
        }

        try {
            // Validate type
            switch (setting.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        throw new Error('Value must be a string');
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number') {
                        throw new Error('Value must be a number');
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        throw new Error('Value must be a boolean');
                    }
                    break;
                case 'json':
                    try {
                        JSON.stringify(value);
                    } catch (error) {
                        throw new Error('Value must be valid JSON');
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        throw new Error('Value must be an array');
                    }
                    break;
            }

            // Validate constraints
            if (setting.validation) {
                if (setting.validation.min !== undefined && value < setting.validation.min) {
                    throw new Error(`Value must be greater than or equal to ${setting.validation.min}`);
                }
                if (setting.validation.max !== undefined && value > setting.validation.max) {
                    throw new Error(`Value must be less than or equal to ${setting.validation.max}`);
                }
                if (setting.validation.pattern && !new RegExp(setting.validation.pattern).test(value)) {
                    throw new Error('Value does not match the required pattern');
                }
                if (setting.validation.enum && !setting.validation.enum.includes(value)) {
                    throw new Error('Value must be one of the allowed values');
                }
            }
        } catch (error) {
            errors.push(`Invalid value for "${key}": ${error.message}`);
        }
    }
    return errors;
};

const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting; 