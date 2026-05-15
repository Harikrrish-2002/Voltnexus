const asyncHandler = require('express-async-handler');
const PartOrder = require('../models/PartOrder');
const Part = require('../models/Part');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Get all orders (for a dealer or worker)
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
    let orders;
    if (req.user.role === 'Dealer') {
        // Dealer sees orders placed with them
        orders = await PartOrder.find({ dealer: req.user.id })
            .populate('worker', 'name email phone')
            .populate('part', 'name category price');
    } else if (req.user.role === 'Worker') {
        // Worker sees orders they have placed
        orders = await PartOrder.find({ worker: req.user.id })
            .populate('dealer', 'name email phone')
            .populate('part', 'name category price');
    } else {
        res.status(403);
        throw new Error('Not authorized to view orders');
    }
    res.status(200).json(orders);
});

// @desc    Place a new order for a spare part
// @route   POST /api/orders
// @access  Private (Worker)
const createOrder = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Worker') {
        res.status(403);
        throw new Error('Only workers can place orders for spare parts');
    }

    const { partId, quantity } = req.body;

    if (!partId || !quantity) {
        res.status(400);
        throw new Error('Please provide partId and quantity');
    }

    const part = await Part.findById(partId);

    if (!part) {
        res.status(404);
        throw new Error('Part not found');
    }

    if (part.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock available');
    }

    const totalCost = part.price * quantity;

    // Create the order
    const order = await PartOrder.create({
        worker: req.user.id,
        dealer: part.dealer,
        part: part._id,
        quantity,
        totalCost,
        status: 'Pending'
    });

    // Decrease the stock of the part
    part.stock -= quantity;
    await part.save();

    res.status(201).json(order);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Dealer)
const updateOrderStatus = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Dealer') {
        res.status(403);
        throw new Error('Only dealers can update order status');
    }

    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const order = await PartOrder.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.dealer.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized to update this order');
    }

    // If cancelling a pending or shipped order, we should probably restock the part
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
        const part = await Part.findById(order.part);
        if (part) {
            part.stock += order.quantity;
            await part.save();
        }
    }

    order.status = status;
    await order.save();

    res.status(200).json(order);
});

// @desc    Create Razorpay Order for Spare Parts
// @route   POST /api/orders/create-razorpay-order
// @access  Private (Worker)
const createRazorpayOrder = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Worker') {
        res.status(403);
        throw new Error('Only workers can place orders for spare parts');
    }

    const { partId, quantity } = req.body;

    if (!partId || !quantity) {
        res.status(400);
        throw new Error('Please provide partId and quantity');
    }

    const part = await Part.findById(partId);

    if (!part) {
        res.status(404);
        throw new Error('Part not found');
    }

    if (part.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock available');
    }

    const totalCost = part.price * quantity;

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: totalCost * 100, // amount in the smallest currency unit
        currency: 'INR',
        receipt: `r_part_${Date.now()}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json({ order, quantity, partId, totalCost, dealerId: part.dealer });
    } catch (error) {
        console.error('Razorpay part order creation failed:', error);
        res.status(500);
        throw new Error('Some error occurred while creating Razorpay order');
    }
});

// @desc    Verify Razorpay Payment Signature and Create Order
// @route   POST /api/orders/verify-razorpay-payment
// @access  Private (Worker)
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Worker') {
        res.status(403);
        throw new Error('Only workers can verify parts orders');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, partId, quantity } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        const part = await Part.findById(partId);

        if (!part) {
            res.status(404);
            throw new Error('Part not found after payment');
        }

        // Just in case stock changed between payment start and success
        if (part.stock < quantity) {
            res.status(400);
            throw new Error('Not enough stock available. Please contact support for a refund.');
        }

        const totalCost = part.price * quantity;

        // Create the order
        const order = await PartOrder.create({
            worker: req.user.id,
            dealer: part.dealer,
            part: part._id,
            quantity,
            totalCost,
            status: 'Pending'
        });

        // Decrease the stock of the part
        part.stock -= quantity;
        await part.save();

        res.json({ success: true, order });
    } else {
        res.status(400);
        throw new Error('Invalid Signature');
    }
});

module.exports = {
    getOrders,
    createOrder,
    updateOrderStatus,
    createRazorpayOrder,
    verifyRazorpayPayment
};
