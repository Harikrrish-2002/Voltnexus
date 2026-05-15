const express = require('express');
const router = express.Router();
const {
    getMyPayments,
    getAllPayments,
    createPayment,
    updatePaymentStatus,
    createRazorpayOrder,
    verifyRazorpayPayment,
    handleRazorpayCallback
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/all').get(protect, getAllPayments);
router.route('/razorpay-callback').get(handleRazorpayCallback);
router.route('/').get(protect, getMyPayments).post(protect, createPayment);
router.route('/create-razorpay-order').post(protect, createRazorpayOrder);
router.route('/verify-razorpay-payment').post(protect, verifyRazorpayPayment);
router.route('/:id/pay').put(protect, updatePaymentStatus);

module.exports = router;
