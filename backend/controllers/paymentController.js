const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { sendSMS, generateUPILink } = require('../utils/smsService');
const { sendEmail } = require('../utils/emailService');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
const getMyPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(payments);
});

// @desc    Get all payments (For Workers/Admins)
// @route   GET /api/payments/all
// @access  Private
const getAllPayments = asyncHandler(async (req, res) => {
    if (req.user.role !== 'Worker' && req.user.role !== 'Admin' && req.user.role !== 'Dealer') {
        res.status(403);
        throw new Error('Not authorized to access all payments');
    }

    const payments = await Payment.find({})
        .populate('user', 'name email')
        .populate('complaint', 'ticketId deviceType model')
        .sort({ createdAt: -1 });

    res.json(payments);
});

// @desc Create a payment/bill (Workers generate bills for Users)
// @route POST /api/payments
const createPayment = asyncHandler(async (req, res) => {
    // When a worker creates a bill, they pass the user ID of the customer who owes the money.
    // If not provided (e.g. self-checkout), it defaults to the logged-in user.
    const { amount, description, complaintId, userId } = req.body;

    const paymentUser = userId || req.user.id;

    const payment = await Payment.create({
        user: paymentUser,
        complaint: complaintId,
        amount,
        description,
        status: 'Pending',
        currency: 'INR'
    });

    // Send SMS and Email Notification with UPI Link
    try {
        const user = await User.findById(paymentUser);

        if (user) {
            let messageBody = `Hello ${user.name}, the work on your device is Completed. Your bill of Rs.${amount} has been generated`;
            let complaintDetails = "";
            let ticketReference = "";
            let deviceType = "device";

            if (complaintId) {
                const complaint = await Complaint.findById(complaintId);
                if (complaint) {
                    deviceType = complaint.deviceType;
                    complaintDetails = ` for your ${deviceType} service (Ticket: ${complaint.ticketId}).`;
                    ticketReference = ` - Ticket ${complaint.ticketId}`;
                }
            } else {
                complaintDetails = ".";
            }

            // Dummy Merchant VPA used for testing: 'voltnexus@ybl'
            const upiLink = generateUPILink('voltnexus@ybl', 'VoltNexus Services', amount, `Bill Payment${ticketReference}`);

            // Generate Razorpay Payment Link
            let razorpayPaymentLink = null;
            try {
                const instance = new Razorpay({
                    key_id: process.env.RAZORPAY_KEY_ID,
                    key_secret: process.env.RAZORPAY_KEY_SECRET,
                });

                const response = await instance.paymentLink.create({
                    amount: Math.round(amount * 100), // in paise, rounded to prevent float errors
                    currency: "INR",
                    accept_partial: false,
                    description: `Bill Payment${ticketReference}`,
                    customer: {
                        name: user.name || "Customer",
                        email: user.email,
                        contact: (user.phone && user.phone.length >= 10) ? String(user.phone) : "+919876543210" // fallback if phone is missing or short
                    },
                    notify: {
                        sms: false,
                        email: false
                    },
                    reminder_enable: false,
                    reference_id: payment._id.toString(),
                    callback_url: `http://localhost:5000/api/payments/razorpay-callback`,
                    callback_method: 'get'
                });

                razorpayPaymentLink = response.short_url;
            } catch (rzpError) {
                console.error("Razorpay Payment Link creation error:", rzpError);
            }

            messageBody += `${complaintDetails} Please pay using this link: ${razorpayPaymentLink || upiLink}`;

            // Send the SMS notification
            if (user.phone) {
                await sendSMS(user.phone, messageBody);
            }

            // Send the Email notification
            if (user.email) {
                const emailSubject = `VoltNexus - Service Completed & Bill Generated`;
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
                        <div style="text-align: center; padding: 20px 0;">
                            <h2 style="color: #4CAF50; margin: 0;">VoltNexus Services</h2>
                        </div>
                        <p>Hello <strong>${user.name}</strong>,</p>
                        <p>Great news! The work on your device is <strong>Completed</strong>.</p>
                        <p>Your bill of <strong>Rs.${amount}</strong> has been generated${complaintDetails}</p>
                        
                        <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #333;">Payment Details</h3>
                            <p style="font-size: 18px; margin: 10px 0;"><strong>Amount Due:</strong> Rs.${amount}</p>
                            <div style="margin-top: 15px;">
                                ${razorpayPaymentLink 
                                    ? `<a href="${razorpayPaymentLink}" style="display: inline-block; background-color: #06b6d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay via Razorpay Gateway</a>`
                                    : `<a href="${upiLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay via UPI Link</a>`
                                }
                            </div>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">Alternatively, you can securely pay online using credit/debit cards or Net Banking by logging into your VoltNexus Dashboard.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #999; text-align: center;">Thank you for choosing VoltNexus!<br/>If you have any questions, please contact our support team.<br/>(Message sent on behalf of ${req.user.name})</p>
                    </div>
                `;
                // Send Email on behalf of current user (Worker)
                await sendEmail(user.email, emailSubject, emailHtml, req.user.email);
            }
        }
    } catch (error) {
        console.error('Failed to send notifications for new bill:', error.message);
    }

    res.status(201).json(payment);
});

// @desc    Update payment status to completed (User pays bill)
// @route   PUT /api/payments/:id/pay
// @access  Private
const updatePaymentStatus = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (payment) {
        // Ensure the payment belongs to the logged-in user
        if (payment.user.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized to pay this bill');
        }

        payment.status = 'Completed';
        // Simulate a transaction ID for the payment
        payment.transactionId = 'TXN' + Math.floor(100000000 + Math.random() * 900000000);
        payment.paymentMethod = req.body.paymentMethod || 'Credit Card';

        const updatedPayment = await payment.save();
        res.json(updatedPayment);
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-razorpay-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
    const { paymentId } = req.body;
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        res.status(404);
        throw new Error('Payment not found');
    }

    if (payment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized to pay this bill');
    }

    const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: payment.amount * 100, // amount in the smallest currency unit
        currency: payment.currency || 'INR',
        receipt: `receipt_order_${payment._id}`,
    };

    try {
        const order = await instance.orders.create(options);
        res.json({ order, payment });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        res.status(500);
        throw new Error('Some error occurred while creating Razorpay order');
    }
});

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify-razorpay-payment
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        const payment = await Payment.findById(paymentId);
        
        if (payment) {
            payment.status = 'Completed';
            payment.transactionId = razorpay_payment_id;
            payment.paymentMethod = 'Razorpay';
            
            const updatedPayment = await payment.save();
            res.json({ success: true, payment: updatedPayment });
        } else {
            res.status(404);
            throw new Error('Payment not found');
        }
    } else {
        res.status(400);
        throw new Error('Invalid Signature');
    }
});

// @desc    Handle Razorpay Payment Link Callback
// @route   GET /api/payments/razorpay-callback
// @access  Public
const handleRazorpayCallback = asyncHandler(async (req, res) => {
    // Razorpay sends these query params via GET
    const { razorpay_payment_id, razorpay_payment_link_id, razorpay_payment_link_reference_id, razorpay_payment_link_status, razorpay_signature } = req.query;

    if (!razorpay_signature) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment_status=failed&reason=no_signature`);
    }

    try {
        const body = razorpay_payment_link_id + "|" + razorpay_payment_link_reference_id + "|" + razorpay_payment_link_status + "|" + razorpay_payment_id;
        
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");
            
        if (expectedSignature === razorpay_signature) {
            // Find payment by reference id
            const payment = await Payment.findById(razorpay_payment_link_reference_id);
            if (payment) {
                payment.status = 'Completed';
                payment.transactionId = razorpay_payment_id;
                payment.paymentMethod = 'Razorpay Payment Link';
                await payment.save();
                
                // Redirect user back to dashboard Bills section
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment_status=success`);
            }
        }
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment_status=failed&reason=invalid_signature`);
    } catch (error) {
        console.error("Callback handling error:", error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?payment_status=failed&reason=server_error`);
    }
});

module.exports = {
    getMyPayments,
    getAllPayments,
    createPayment,
    updatePaymentStatus,
    createRazorpayOrder,
    verifyRazorpayPayment,
    handleRazorpayCallback
};
