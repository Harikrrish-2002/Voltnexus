const nodemailer = require('nodemailer');

/**
 * Send an HTML email using Nodemailer configured for Gmail.
 * Fallbacks to console log if no credentials are provided in .env
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML format email body
 * @returns {Promise<boolean>}
 */
const sendEmail = async (to, subject, htmlContent, workerEmail = null) => {
    try {
        if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
            console.log('\n======================================================');
            console.log(`[MOCK EMAIL SERVICE] Sending Email to: ${to}`);
            console.log(`[SUBJECT]: ${subject}`);
            console.log(`[CONTENT]:\n${htmlContent}`);
            console.log('======================================================\n');
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        const fromHeader = workerEmail 
            ? `"VoltNexus (on behalf of ${workerEmail})" <${process.env.GMAIL_EMAIL}>`
            : `"VoltNexus" <${process.env.GMAIL_EMAIL}>`;

        const mailOptions = {
            from: fromHeader,
            replyTo: workerEmail || process.env.GMAIL_EMAIL,
            to: to,
            subject: subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${to}: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendEmail
};
