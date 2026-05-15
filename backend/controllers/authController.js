const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { sendSMS } = require('../utils/smsService');
const { sendEmail } = require('../utils/emailService');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone || !role) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Validations
    if (!/^\d{1,10}$/.test(phone)) {
        res.status(400);
        throw new Error('Phone number should not exceed 10 digits');
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
        res.status(400);
        throw new Error('Email must be a valid Gmail address');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine status
    let userRole = role;
    let userStatus = 'Active';

    if (email === 'admin@voltnexus.com') {
        userRole = 'Admin';
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: userRole,
        status: userStatus
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: user.phone,
            token: generateToken(user._id) // Added phone to response
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        if (role && user.role !== role) {
            res.status(400);
            throw new Error('Invalid credentials');
        }
        console.log('Login User Found:', {
            id: user._id,
            email: user.email,
            role: user.role,
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables!");
    }
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
    console.log("Generated Token:", token);
    return token;
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Please provide email and OTP');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.otp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    if (user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    // Success: Activate user (if not already) and clear OTP
    user.status = 'Active';
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        token: generateToken(user._id)
    });
});

// @desc    Request Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { identifier } = req.body;

    if (!identifier) {
        res.status(400);
        throw new Error('Please provide an email or phone number');
    }

    // Find User by email or phone
    const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
        res.status(404);
        throw new Error('No account found with that email or phone number');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP to user (valid for 10 mins)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Send the OTP
    const message = `Your VoltNexus password reset OTP is ${otp}. It is valid for 10 minutes.`;
    const emailSubject = 'VoltNexus - Password Reset Request';
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #06b6d4;">VoltNexus Password Reset</h2>
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>You have requested to reset your password. Here is your One-Time Password (OTP):</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0; color: #111;">
                ${otp}
            </div>
            <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666;">If you did not request a password reset, please ignore this email.</p>
        </div>
    `;

    if (user.phone) {
        await sendSMS(user.phone, message);
    }
    
    if (user.email) {
        await sendEmail(user.email, emailSubject, emailHtml);
    }

    res.status(200).json({ message: 'OTP sent successfully to your registered contact.' });
});

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { identifier, otp, newPassword } = req.body;

    if (!identifier || !otp || !newPassword) {
        res.status(400);
        throw new Error('Please provide all details');
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(newPassword)) {
        res.status(400);
        throw new Error('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.otp !== otp) {
        res.status(400);
        throw new Error('Invalid OTP');
    }

    if (user.otpExpires < Date.now()) {
        res.status(400);
        throw new Error('OTP has expired');
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    // Send successful message
    res.json({ message: 'Password has been successfully changed! You can now login with your new password.' });
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    verifyOTP,
    forgotPassword,
    resetPassword
};
