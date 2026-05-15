const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Payment = require('../models/Payment');
const Feedback = require('../models/Feedback');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

// @desc    Get all dealers
// @route   GET /api/users/dealers
// @access  Private
const getDealers = asyncHandler(async (req, res) => {
    const dealers = await User.find({ role: 'Dealer', status: 'Active' }).select('-password');
    res.json(dealers);
});

// @desc    Get pending users
// @route   GET /api/users/pending
// @access  Private/Admin
const getPendingUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ status: 'Pending' });
    res.json(users);
});

const { sendEmail } = require('../utils/emailService');

// @desc    Update user status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        const oldStatus = user.status;
        const newStatus = req.body.status;

        // If admin is approving (setting to Active) a Worker/Dealer
        if (newStatus === 'Active' && (user.role === 'Worker' || user.role === 'Dealer') && oldStatus === 'Pending') {
            user.status = 'Approved'; // Set to Approved first, then Active after OTP

            // Generate 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

            const loginLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?email=${user.email}&verify=true`;
            const message = `Congratulations! Your account as a ${user.role} has been approved. \n\nUse the following temporary OTP to verify your account and login: ${otp}\n\nThis OTP is valid for 10 minutes. Click here to verify and login: ${loginLink}`;

            try {
                await sendEmail(
                    user.email,
                    'VoltNexus Account Approved',
                    message
                );
                console.log(`OTP sent to ${user.email}: ${otp}`);
            } catch (error) {
                console.error("Email sending failed:", error);
            }
        } else {
            user.status = newStatus || user.status;
        }

        // If Rejected
        if (user.status === 'Rejected' && oldStatus !== 'Rejected') {
            const message = `We regret to inform you that your registration as a ${user.role} has been rejected. \n\nIf you have any questions, please contact support.`;
            try {
                await sendEmail(
                    user.email,
                    'VoltNexus Account Registration Update',
                    message
                );
            } catch (error) {
                console.error("Email sending failed:", error);
            }
        }

        const updatedUser = await user.save();
        res.json(updatedUser);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'Admin') {
            res.status(400);
            throw new Error('Cannot delete Admin user');
        }

        // Cascade delete related records
        await Complaint.deleteMany({ user: user._id });
        await Payment.deleteMany({ user: user._id });
        await Feedback.deleteMany({ user: user._id });

        // If the user being deleted is a Worker, we should also unassign them from complaints
        if (user.role === 'Worker') {
            await Complaint.updateMany({ assignedWorker: user._id }, { $unset: { assignedWorker: 1 } });
        }

        await user.deleteOne();
        res.json({ message: 'User and all related records removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUsers,
    getDealers,
    getPendingUsers,
    updateUserStatus,
    deleteUser,
};
