const express = require("express");
const Guide = require("../models/Guide");

const router = express.Router();

// Create a new guide
router.post("/guides", async (req, res) => {
  try {
    const { name, username, email, destination, languages } = req.body;

    if (!name || !username || !email || !destination || !languages) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedLanguages = Array.isArray(languages)
      ? languages
      : String(languages)
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);

    const guide = new Guide({ name, username, email, destination, languages: normalizedLanguages });
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



