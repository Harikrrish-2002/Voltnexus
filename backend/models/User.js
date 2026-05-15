const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    role: {
        type: String,
        enum: ['User', 'Worker', 'Dealer', 'Admin'],
        default: 'User'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Active', 'Inactive', 'Rejected'],
        default: 'Active' // Users/Admins are Active by default, Workers/Dealers might be Pending
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
