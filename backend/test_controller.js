const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createPayment } = require('./controllers/paymentController');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Payment = require('./models/Payment');

dotenv.config();

const testFunctionality = async () => {
    let connection;
    try {
        console.log('Connecting to DB...');
        connection = await mongoose.connect(process.env.MONGO_URI);

        await User.deleteMany({ email: { $in: ['worker_test_123@example.com', 'customer_test_123@example.com'] } });

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

        const complaint = await Complaint.create({
            user: customer._id,
            ticketId: 'TEST-1234',
            deviceType: 'Laptop',
            model: 'Test Model',
            issue: 'Screen broken',
            description: 'Testing',
            preferredDate: new Date(),
            status: 'Completed',
            estimatedDelivery: 'Done'
        });

        console.log('Dummy records created. Executing createPayment...');

        const req = {
            user: { id: worker._id, name: worker.name, email: worker.email, role: 'Worker' },
            body: {
                amount: 1500,
                description: 'Bill for Laptop - Issue: Screen broken',
                complaintId: complaint._id,
                userId: customer._id
            }
        };

        const res = {
            status: function(code) { 
                this.statusCode = code; 
                return this; 
            },
            json: function(data) { 
                console.log('--- FINAL RESPONSE ---');
                console.log(data); 
                this.data = data;
            }
        };

        // Call the asyncHandler wrapped function by mimicking express passing req, res, next
        await createPayment(req, res, (err) => {
            if (err) console.error('Error in middleware:', err);
        });

        console.log('\n✅ Script Execution Complete. If Razorpay & Nodemailer are configured, check logs for "Email sent successfully".');

        // Cleanup
        if (res.data) await Payment.findByIdAndDelete(res.data._id);
        await Complaint.findByIdAndDelete(complaint._id);
        await User.findByIdAndDelete(worker._id);
        await User.findByIdAndDelete(customer._id);
        console.log('Cleaned up DB.');

    } catch (e) {
        console.error('Test failed:', e);
    } finally {
        if (connection) {
            await mongoose.disconnect();
        }
    }
};

testFunctionality();
