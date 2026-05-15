const mongoose = require('mongoose');

const partSchema = mongoose.Schema({
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Please add a part name']
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Part', partSchema);
