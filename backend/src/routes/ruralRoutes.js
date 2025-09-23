const express = require("express");
const RuralPlace = require("../models/RuralPlace");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Multer setup for rural images
const ruralUploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(ruralUploadDir)) {
  fs.mkdirSync(ruralUploadDir, { recursive: true });
}
const ruralStorage = multer.diskStorage({
  destination: function (_req, _file, cb) { cb(null, ruralUploadDir); },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'rural-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const ruralFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};
const uploadRuralImage = multer({ storage: ruralStorage, fileFilter: ruralFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all active rural places (public)
router.get("/rural-places", async (_req, res) => {
  try {
    const ruralPlaces = await RuralPlace.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(ruralPlaces);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin routes for rural place management
// Get all rural places for admin
router.get("/admin/rural-places", async (_req, res) => {
  try {
    const ruralPlaces = await RuralPlace.find().sort({ createdAt: -1 });
    res.json(ruralPlaces);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create new rural place
router.post("/admin/rural-places", uploadRuralImage.single('image'), async (req, res) => {
  try {
    const { name, description, region, price } = req.body;

    if (!name || !description || !region || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const ruralPlace = new RuralPlace({ 
      name, 
      description, 
      image: imagePath, 
      region, 
      price,
      createdBy: 'admin'
    });
    
    await ruralPlace.save();
    res.status(201).json({ message: "Rural place created successfully", ruralPlace });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update rural place
router.put("/admin/rural-places/:id", uploadRuralImage.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, region, price, status } = req.body;

    const update = { name, description, region, price, status };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const ruralPlace = await RuralPlace.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!ruralPlace) {
      return res.status(404).json({ message: "Rural place not found" });
    }

    res.json({ message: "Rural place updated successfully", ruralPlace });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete rural place
router.delete("/admin/rural-places/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const ruralPlace = await RuralPlace.findByIdAndDelete(id);
    
    if (!ruralPlace) {
      return res.status(404).json({ message: "Rural place not found" });
    }
    
    res.json({ message: "Rural place deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Toggle rural place status
router.patch("/admin/rural-places/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    
    const ruralPlace = await RuralPlace.findById(id);
    if (!ruralPlace) {
      return res.status(404).json({ message: "Rural place not found" });
    }
    
    ruralPlace.status = ruralPlace.status === 'active' ? 'inactive' : 'active';
    await ruralPlace.save();
    
    res.json({ message: `Rural place ${ruralPlace.status}`, ruralPlace });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;


