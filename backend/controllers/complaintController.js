const asyncHandler = require('express-async-handler');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Payment = require('../models/Payment');
const { sendSMS, generateUPILink } = require('../utils/smsService');
const { sendEmail } = require('../utils/emailService');

// @desc    Register new complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = asyncHandler(async (req, res) => {
    const { deviceType, model, issue, description, preferredDate } = req.body;

    if (!deviceType || !model || !issue) {
        res.status(400);
        throw new Error('Please add all required fields');
    }

    // Generate a simple ticket ID (e.g., VN-1001)
    const count = await Complaint.countDocuments();
    const ticketId = `VN-${1000 + count + 1}`;

    const complaint = await Complaint.create({
        user: req.user.id,
        ticketId,
        deviceType,
        model,
        issue,
        description,
        preferredDate,
        status: 'Pending',
        estimatedDelivery: 'Calculating...'
    });

    res.status(201).json(complaint);
});

// @desc    Get user complaints
// @route   GET /api/complaints
// @access  Private
const getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
});

// @desc    Get all user complaints (For Workers/Admins)
// @route   GET /api/complaints/all
// @access  Private
const getAllComplaints = asyncHandler(async (req, res) => {
    // Optional: We can add a check here if req.user.role === 'Worker' || req.user.role === 'Admin'
    if (req.user.role !== 'Worker' && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to access all complaints');
    }

    const complaints = await Complaint.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(complaints);
});

// @desc    Update complaint status (For Workers/Admins)
// @route   PUT /api/complaints/:id/status
// @access  Private
const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Waiting for parts', 'Completed', 'Not repairable', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error('Invalid status value');
    }

    if (req.user.role !== 'Worker' && req.user.role !== 'Admin') {
        res.status(403);
        throw new Error('Not authorized to update complaint status');
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
        res.status(404);
        throw new Error('Complaint not found');
    }

    complaint.status = status;
    const updatedComplaint = await complaint.save();

    // Send SMS Notification when status becomes 'Completed'
    if (status === 'Completed') {
        try {
            // Fetch User to get phone number
            const user = await User.findById(complaint.user);

            // Check if there's a pending payment for this complaint
            const pendingPayment = await Payment.findOne({ complaint: complaint._id, status: 'Pending' });

            if (user) {
                let messageBody = `Hello ${user.name}, your service for ${complaint.deviceType} (Ticket: ${complaint.ticketId}) is now Completed.`;

                if (pendingPayment) {
                    // Generate UPI link
                    const upiLink = generateUPILink('voltnexus@ybl', 'VoltNexus Services', pendingPayment.amount, `Payment for ${complaint.ticketId}`);
                    messageBody += ` Your bill amount is Rs.${pendingPayment.amount}. Please pay using this link: ${upiLink}`;
                } else {
                    messageBody += ` If a bill needs to be generated, it will be sent to you shortly.`;
                }

                if (user.phone) {
                    await sendSMS(user.phone, messageBody);
                }

                if (user.email) {
                    const emailSubject = `VoltNexus - Service Completed`;
                    const emailHtml = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
                            <div style="text-align: center; padding: 20px 0;">
                                <h2 style="color: #4CAF50; margin: 0;">VoltNexus Services</h2>
                            </div>
                            <p>Hello <strong>${user.name}</strong>,</p>
                            <p>Your service for <strong>${complaint.deviceType}</strong> (Ticket: ${complaint.ticketId}) is now <strong>Completed</strong>.</p>
                            ${pendingPayment ? `<p>Your bill amount is Rs.${pendingPayment.amount}. Please login to your dashboard to view the bill.</p>` : '<p>If a bill needs to be generated, it will be sent to you shortly.</p>'}
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
                            <p style="font-size: 12px; color: #999; text-align: center;">Thank you for choosing VoltNexus!<br/>(Message sent on behalf of ${req.user.name})</p>
                        </div>
                    `;
                    // Send Email on behalf of current user (Worker)
                    await sendEmail(user.email, emailSubject, emailHtml, req.user.email);
                }
            }
        } catch (error) {
            console.error('Failed to send SMS/Email notification on complaint completion:', error.message);
        }
    }

    res.json(updatedComplaint);
});

module.exports = {
    createComplaint,
    getMyComplaints,
    getAllComplaints,
    updateComplaintStatus
};
