const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    }
}, {
    timestamps: true,
    collection: 'feedback' // Explicitly setting collection name as requested
});

module.exports = mongoose.model('Feedback', feedbackSchema);
