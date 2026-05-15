const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    complaint: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
    },
    transactionId: {
        type: String,
    },
    description: {
        type: String, // e.g., "Screen Replacement Bill"
    }
}, {
    timestamps: true,
    collection: 'payments' // Explicitly setting collection name as requested
});

module.exports = mongoose.model('Payment', paymentSchema);
