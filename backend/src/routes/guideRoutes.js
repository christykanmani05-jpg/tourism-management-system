const express = require("express");
const Guide = require("../models/Guide");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Multer setup for guide images
const guideUploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(guideUploadDir)) {
  fs.mkdirSync(guideUploadDir, { recursive: true });
}
const guideStorage = multer.diskStorage({
  destination: function (_req, _file, cb) { cb(null, guideUploadDir); },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'guide-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const guideFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};
const uploadGuideImage = multer({ storage: guideStorage, fileFilter: guideFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Create a new guide
router.post("/guides", uploadGuideImage.single('image'), async (req, res) => {
  try {
    const { name, username, email, destination, languages } = req.body;

    if (!name || !username || !email || !destination || !languages) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Image is optional for guides; include if provided
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const normalizedLanguages = Array.isArray(languages)
      ? languages
      : String(languages)
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);

    const guide = new Guide({ name, username, email, destination, image: imagePath, languages: normalizedLanguages });
    await guide.save();
    res.status(201).json({ message: "Guide created", guide });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// List all guides (public - only approved)
router.get("/guides", async (_req, res) => {
  try {
    const guides = await Guide.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin routes for guide management
// List all guides for admin (including pending/rejected)
router.get("/admin/guides", async (_req, res) => {
  try {
    const guides = await Guide.find().sort({ createdAt: -1 });
    res.json(guides);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Approve a guide
router.patch("/admin/guides/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    
    const guide = await Guide.findByIdAndUpdate(
      id,
      { 
        status: 'approved', 
        approvedBy: approvedBy || 'admin',
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }
    
    res.json({ message: "Guide approved successfully", guide });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reject a guide
router.patch("/admin/guides/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy } = req.body;
    
    const guide = await Guide.findByIdAndUpdate(
      id,
      { 
        status: 'rejected', 
        approvedBy: approvedBy || 'admin',
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!guide) {
      return res.status(404).json({ message: "Guide not found" });
    }
    
    res.json({ message: "Guide rejected successfully", guide });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;



