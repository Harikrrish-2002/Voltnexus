const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const jwt = require('jsonwebtoken');

dotenv.config();

const testBillFlow = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(process.env.MONGO_URI);

        // 1. Find a Worker and a User
        const worker = await User.findOne({ role: 'Worker' });
        const customer = await User.findOne({ role: 'User' });
        
        if (!worker || !customer) {
            console.log('Need both a worker and a user in DB to test.');
            return;
        }

        console.log(`Using Worker: ${worker.email}`);
        console.log(`Using Customer: ${customer.email}`);

        // 2. Create a dummy complaint to attach to the bill
        const complaint = await Complaint.create({
            user: customer._id,
            ticketId: 'TEST-' + Math.floor(Math.random() * 10000),
            deviceType: 'Laptop',
            model: 'Test Model',
            issue: 'Screen broken',
            description: 'Testing bill generation',
            preferredDate: new Date(),
            status: 'Completed',
            estimatedDelivery: 'Done'
        });

        console.log(`Created dummy complaint: ${complaint.ticketId}`);

        // 3. Generate token for worker
        const token = jwt.sign({ id: worker._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        // 4. Hit the POST /api/payments endpoint as the worker
        console.log('Sending request to generate bill...');
        const response = await axios.post('http://localhost:5000/api/payments', {
            amount: 1500, // 1500 INR
            description: 'Bill for Laptop - Issue: Screen broken',
            complaintId: complaint._id,
            userId: customer._id
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log('Response Status:', response.status);
        console.log('Bill Created in DB:', response.data._id);
        console.log('Amount:', response.data.amount);
        
        console.log('\n✅ Successfully tested! Check the worker\'s console to ensure no Razorpay errors occurred and check if email was dispatched.');

        // Clean up dummy complaint
        await Complaint.findByIdAndDelete(complaint._id);
        // Clean up dummy payment
        const Payment = require('./models/Payment');
        await Payment.findByIdAndDelete(response.data._id);
        
        console.log('Cleaned up test data.');
        
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
    } finally {
        if (connection) {
            await mongoose.disconnect();
        }
    }
};

testBillFlow();
