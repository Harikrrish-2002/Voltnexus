const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createPayment } = require('./controllers/paymentController');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Mock req and res
        const req = {
            user: { id: 'test_worker_id', email: 'worker@test.com', name: 'Test Worker' },
            body: {
                amount: 100,
                description: 'Test Bill',
                complaintId: null,
                userId: 'test_user_id'
            }
        };

        const res = {
            status: function(code) { this.statusCode = code; return this; },
            json: function(data) { console.log('Response:', data); }
        };

        // We need an actual user ID from the DB
        const User = require('./models/User');
        const user = await User.findOne({ role: 'User' });
        if(user) {
            req.body.userId = user._id;
            console.log('Testing with User:', user.email);
            
            // Bypass asyncHandler wrapping for testing
            const Payment = require('./models/Payment');
            const crypto = require('crypto');
            const Razorpay = require('razorpay');
            const { sendEmail } = require('./utils/emailService');
            
            // Just run the logic of createPayment manually to see where it fails
            
            console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
        }

        mongoose.connection.close();
    } catch (e) {
        console.error(e);
    }
};

test();
