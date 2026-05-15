const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.route('/all').get(protect, getAllComplaints);
router.route('/:id/status').put(protect, updateComplaintStatus);
router.route('/').get(protect, getMyComplaints).post(protect, createComplaint);

module.exports = router;
