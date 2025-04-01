const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true, // from Firebase
    },
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [6, 'Username must be at least 6 characters long'],
        maxlength: [50, 'Username cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    role: {
        type: String,
        enum: ['patient', 'doctor', 'admin'],
        required: [true, 'User role is required']
    },
    contactInfo: {
        phone: {
            type: String,
            trim: true,
            match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: {
                type: String,
                match: [/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code']
            }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true,
    discriminatorKey: 'role'
});

const User = mongoose.model('User', UserSchema);

module.exports = User;