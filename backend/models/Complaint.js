const mongoose = require('mongoose');

const complaintSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    ticketId: {
        type: String,
        required: true,
        unique: true
    },
    deviceType: {
        type: String,
        required: [true, 'Please add a device type']
    },
    model: {
        type: String,
        required: [true, 'Please add a model']
    },
    issue: {
        type: String,
        required: [true, 'Please add an issue summary']
    },
    description: {
        type: String,
    },
    preferredDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Waiting for parts', 'Completed', 'Not repairable', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    estimatedDelivery: {
        type: String,
        default: 'Calculating...'
    },
    assignedWorker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    collection: 'repairs' // Explicitly setting collection name as requested
});

module.exports = mongoose.model('Complaint', complaintSchema);
