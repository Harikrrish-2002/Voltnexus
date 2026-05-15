const dotenv = require('dotenv');
const Razorpay = require('razorpay');
dotenv.config();

const test = async () => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        console.log('Creating Razorpay Link...');
        const response = await instance.paymentLink.create({
            amount: 100 * 100, // 100 INR
            currency: "INR",
            accept_partial: false,
            description: "Test Bill Payment",
            customer: {
                name: "Test Customer",
                email: "test@example.com",
                contact: "+919876543210"
            },
            notify: {
                sms: false,
                email: false
            },
            reminder_enable: false,
            reference_id: "test_ref_12345",
            callback_url: `http://localhost:5000/api/payments/razorpay-callback`,
            callback_method: 'get'
        });

        console.log('Response:', response);
    } catch (e) {
        console.error('Error:', e);
    }
};

test();
