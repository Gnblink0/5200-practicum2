const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'doctor', 'patient', 'staff'], required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    profileImage: { type: String },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    medicalHistory: [{
        condition: String,
        diagnosis: String,
        treatment: String,
        date: Date
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationTokenExpires: Date
}, {
    timestamps: true
});

// Indexes
userSchema.index({ email: 1, username: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ firstName: 1, lastName: 1 });

// Middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

userSchema.methods.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email });
};

userSchema.statics.findByUsername = function(username) {
    return this.findOne({ username });
};

userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true });
};

userSchema.statics.findByRole = function(role) {
    return this.find({ role, isActive: true });
};

// Virtual properties
userSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
        age--;
    }
    return age;
});

// Instance methods for medical history
userSchema.methods.addMedicalHistory = async function(condition, diagnosis, treatment) {
    this.medicalHistory.push({
        condition,
        diagnosis,
        treatment,
        date: new Date()
    });
    await this.save();
};

userSchema.methods.getMedicalHistory = function() {
    return this.medicalHistory.sort((a, b) => b.date - a.date);
};

// Instance methods for emergency contact
userSchema.methods.updateEmergencyContact = async function(name, phone, relationship) {
    this.emergencyContact = { name, phone, relationship };
    await this.save();
};

// Instance methods for profile
userSchema.methods.updateProfile = async function(updates) {
    Object.assign(this, updates);
    await this.save();
};

// Instance methods for account status
userSchema.methods.deactivateAccount = async function() {
    this.isActive = false;
    await this.save();
};

userSchema.methods.activateAccount = async function() {
    this.isActive = true;
    await this.save();
};

// Check if account is locked
userSchema.methods.isLocked = function() {
    return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function() {
    this.loginAttempts += 1;
    
    if (this.loginAttempts >= config.security.maxLoginAttempts) {
        this.lockUntil = Date.now() + config.security.lockoutTime;
    }
    
    await this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
};

// Hide sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.verificationToken;
    delete obj.verificationTokenExpires;
    return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 