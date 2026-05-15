const mongoose = require('mongoose');

const partOrderSchema = mongoose.Schema({
    worker: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    part: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Part'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    totalCost: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PartOrder', partOrderSchema);
