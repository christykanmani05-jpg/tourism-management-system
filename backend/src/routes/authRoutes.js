const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const { sendMail } = require("../utils/mailer");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

// Signup Route with file upload
router.post("/signup", upload.single('profilePhoto'), async (req, res) => {
  const { username, password, email } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Handle profile photo
    let profilePhoto = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; // default
    if (req.file) {
      profilePhoto = `/uploads/${req.file.filename}`;
    }

    const newUser = new User({ 
      username, 
      password, 
      email, 
      profilePhoto,
      role: 'user' 
    });
    await newUser.save();

    res.json({ 
      message: "Signup successful!", 
      user: { 
        username: newUser.username, 
        email: newUser.email,
        profilePhoto: newUser.profilePhoto,
        role: newUser.role
      } 
    });
  } catch (err) {
    // If there's an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file:', unlinkErr);
      });
    }
    res.status(500).json({ message: "Server error: " + err.message });
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

    res.json({ 
      message: "Login successful!", 
      user: { 
        username: user.username, 
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role
      } 
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Admin Login Route
router.post("/admin/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password, role: 'admin' });
    if (!user) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    res.json({ 
      message: "Admin login successful!", 
      user: { 
        username: user.username, 
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role
      } 
    });
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

    const { info, previewUrl } = await sendMail(mailOptions);
    res.json({ message: "Email sent successfully", ...(previewUrl ? { previewUrl } : {}) });
  } catch (err) {
    console.error("Email send error:", err.message);
    res.status(500).json({ message: "Failed to send email", error: err.message });
  }
});

// Admin User Management Routes

// Get all users (admin only)
router.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete user (admin only)
router.delete("/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    const currentUser = await User.findById(id);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // You might want to add additional checks here to prevent deleting the last admin
    const deletedUser = await User.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully", user: { username: deletedUser.username, email: deletedUser.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user role (admin only)
router.patch("/admin/users/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'admin'" });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User role updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
