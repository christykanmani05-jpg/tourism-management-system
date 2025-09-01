const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");

// Build transporter. If no SMTP creds, fall back to Ethereal for testing.
async function getMailTransporter() {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

// Signup Route
router.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ username, password, email });
    await newUser.save();

    res.json({ message: "Signup successful!", user: { username: newUser.username, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" + err});
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    console.log(username,password)
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({ message: "Login successful!", user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Contact Route - send email to the logged-in user's email
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: "Email and message are required" });
  }

  try {
    // Ensure the email belongs to a registered user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found for provided email" });
    }

    const fromAddress = process.env.MAIL_FROM || process.env.SMTP_USER || "no-reply@triotrails.com";

    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: "Thanks for contacting TrioTrails",
      text: `Hi ${name || user.username},\n\nWe received your message:\n\n${message}\n\nWe'll get back to you shortly!\n\n— TrioTrails Team`,
      html: `<p>Hi <strong>${name || user.username}</strong>,</p>
             <p>We received your message:</p>
             <blockquote>${message.replace(/</g, "&lt;")}</blockquote>
             <p>We'll get back to you shortly!</p>
             <p>— TrioTrails Team</p>`
    };

    const transporter = await getMailTransporter();
    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, include preview URL to aid testing
    const previewUrl = nodemailer.getTestMessageUrl(info);
    res.json({ message: "Email sent successfully", ...(previewUrl ? { previewUrl } : {}) });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ message: "Failed to send email" });
  }
});

module.exports = router;
