const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Payment = require('./models/Payment');
const jwt = require('jsonwebtoken');

dotenv.config();

const testBillFlow = async () => {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mongoose.connect(process.env.MONGO_URI);

        // 1. Create a dummy Worker and a dummy User
        const worker = await User.create({
            name: 'Test Worker',
            email: 'worker_test_123@example.com',
            password: 'password123',
            role: 'Worker',
            phone: '9876543210'
        });

        const customer = await User.create({
            name: 'Test Customer',
            email: 'customer_test_123@example.com',
            password: 'password123',
            role: 'User',
            phone: '9123456789'
        });

        console.log(`Created Worker: ${worker.email}`);
        console.log(`Created Customer: ${customer.email}`);

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

        console.log('--- RESPONSE FROM SERVER ---');
        console.log('Response Status:', response.status);
        console.log('Bill Created in DB:', response.data._id);
        console.log('Amount:', response.data.amount);
        console.log('Description:', response.data.description);
        console.log('Status:', response.data.status);
        
        console.log('\n✅ Successfully tested! Check the terminal running "npm run dev" in backend to see the "Email sent successfully" logs.');

        // Clean up dummy data
        await Payment.findByIdAndDelete(response.data._id);
        await Complaint.findByIdAndDelete(complaint._id);
        await User.findByIdAndDelete(worker._id);
        await User.findByIdAndDelete(customer._id);
        
        console.log('Cleaned up test data.');
        
    } catch (error) {
        console.error('Test failed:', error.response ? error.response.data : error.message);
        
        // Ensure cleanup even on failure
        if (error.response && error.response.data && error.response.data._id) {
            await Payment.findByIdAndDelete(error.response.data._id);
        }
    } finally {
        if (connection) {
            await mongoose.disconnect();
        }
    }
};

testBillFlow();
