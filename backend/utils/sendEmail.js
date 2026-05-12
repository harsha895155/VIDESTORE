const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async ({ to, subject, html }) => {
    try {
        const mailOptions = {
            from: `VideStore <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Nodemailer Success] Sent to ${to} | Msg ID: ${info.messageId}`);
        return { success: true, data: info };
    } catch (err) {
        console.error(`[Nodemailer Error] To: ${to} | Msg: ${err.message}`);
        return { success: false, error: err.message };
    }
};

module.exports = sendEmail;
