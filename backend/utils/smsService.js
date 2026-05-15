const twilio = require('twilio');

/**
 * SMS & WhatsApp Service utilizing Twilio API
 * Fallbacks to console logging if credentials are not in .env
 */

const sendSMS = async (phone, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !twilioPhone) {
            console.log('\n======================================================');
            console.log(`[MOCK SMS SERVICE] Sending SMS/WhatsApp to: ${phone}`);
            console.log(`[MESSAGE CONTENT]:\n${message}`);
            console.log('======================================================\n');

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        }

        const client = twilio(accountSid, authToken);
        
        // Ensure phone has country code +91 for India if not already formatted properly,
        // Assuming user phones are stored simply.
        let formattedPhone = phone;
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+91${phone}`; 
        }

        // Send via Twilio SMS by default, but if user configures a WhatsApp number in TWILIO_PHONE_NUMBER,
        // they can also send via WhatsApp.
        const msgOptions = {
            body: message,
            from: twilioPhone, // E.g., 'whatsapp:+14155238886' or standard Twilio number
            to: twilioPhone.startsWith('whatsapp:') ? `whatsapp:${formattedPhone}` : formattedPhone
        };

        const info = await client.messages.create(msgOptions);
        console.log(`Twilio Message Sent: ${info.sid}`);
        return true;
    } catch (error) {
        console.error('Failed to send Twilio message:', error.message);
        return false;
    }
};

/**
 * Generate a standard UPI payment intent link.
 * @param {string} payeeVPA - The merchant's UPI ID (e.g., merchant@upi).
 * @param {string} payeeName - The merchant's name.
 * @param {number|string} amount - The amount to be paid.
 * @param {string} transactionNote - A note/description for the payment.
 * @returns {string} - The formatted UPI link.
 */
const generateUPILink = (payeeVPA, payeeName, amount, transactionNote) => {
    const baseUrl = 'upi://pay';
    const params = new URLSearchParams({
        pa: payeeVPA,
        pn: payeeName,
        am: amount.toString(),
        cu: 'INR',
        tn: transactionNote
    });

    return `${baseUrl}?${params.toString()}`;
};

module.exports = {
    sendSMS,
    generateUPILink
};
