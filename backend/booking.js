const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/book', async (req, res) => {
    const { name, email, destination } = req.body;

    if (!name || !email || !destination) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Configure your email transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'albinbiju618@gmail.com', // replace with your email
            pass: 'mweq bfrm igks ueji' // use an app password, not your real password
        }
    });

    // Email content
    let mailOptions = {
        from: 'yourbookingemail@gmail.com',
        to: 'yourbookingemail@gmail.com', // where you want to receive bookings
        subject: 'New Booking Request',
        text: `Name: ${name}\nEmail: ${email}\nDestination: ${destination}`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Booking confirmed and email sent!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send booking email.' });
    }
});

module.exports = router;