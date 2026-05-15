const express = require('express');
const router = express.Router();
const {
    getOrders,
    createOrder,
    updateOrderStatus,
    createRazorpayOrder,
    verifyRazorpayPayment
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getOrders)
    .post(protect, createOrder);

router.route('/create-razorpay-order').post(protect, createRazorpayOrder);
router.route('/verify-razorpay-payment').post(protect, verifyRazorpayPayment);

router.route('/:id/status')
    .put(protect, updateOrderStatus);

module.exports = router;
