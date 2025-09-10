const express = require('express');
const nodemailer = require('nodemailer');
const { sendMail } = require('./src/utils/mailer');
const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, destination } = req.body;

    if (!name || !email || !destination) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Email content
    let mailOptions = {
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: process.env.SMTP_USER,
        subject: 'New Booking Request',
        text: `Name: ${name}\nEmail: ${email}\nDestination: ${destination}`
    };

    try {
        const { previewUrl } = await sendMail(mailOptions);
        res.json({ message: 'Booking confirmed and email sent!', ...(previewUrl ? { previewUrl } : {}) });
    } catch (error) {
        console.error('Booking email error:', error.message);
        res.status(500).json({ error: 'Failed to send booking email.', details: error.message });
    }
});

module.exports = router;