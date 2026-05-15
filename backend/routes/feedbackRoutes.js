const express = require('express');
const router = express.Router();
const {
    createFeedback,
    getMyFeedbacks,
    updateFeedback,
    deleteFeedback
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createFeedback)
    .get(protect, getMyFeedbacks);

router.route('/:id')
    .put(protect, updateFeedback)
    .delete(protect, deleteFeedback);

module.exports = router;
