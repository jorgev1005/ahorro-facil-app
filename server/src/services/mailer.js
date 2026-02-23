const nodemailer = require('nodemailer');

// Define transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Standard setup for Gmail, adjust if sending from another SMTP
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS // Gmail App Password
    }
});

// Helper to send emails
const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Ahorro Fácil" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });
        console.log(`Email sent to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendEmail };
