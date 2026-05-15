const asyncHandler = require('express-async-handler');
const Feedback = require('../models/Feedback');

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = asyncHandler(async (req, res) => {
    const { message, rating } = req.body;

    if (!message) {
        res.status(400);
        throw new Error('Please add a message');
    }

    const feedback = await Feedback.create({
        user: req.user.id,
        message,
        rating
    });

    res.status(201).json(feedback);
});

// @desc    Get my feedbacks
// @route   GET /api/feedback
// @access  Private
const getMyFeedbacks = asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(feedbacks);
});

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
const updateFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    // Check if feedback belongs to user
    if (feedback.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json(updatedFeedback);
});

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
        res.status(404);
        throw new Error('Feedback not found');
    }

    // Check if feedback belongs to user
    if (feedback.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    await feedback.deleteOne();

    res.json({ id: req.params.id });
});

module.exports = {
    createFeedback,
    getMyFeedbacks,
    updateFeedback,
    deleteFeedback
};
