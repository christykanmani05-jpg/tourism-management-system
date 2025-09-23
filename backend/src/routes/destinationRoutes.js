const express = require("express");
const Destination = require("../models/Destination");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Multer setup for destination images
const destUploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(destUploadDir)) {
  fs.mkdirSync(destUploadDir, { recursive: true });
}
const destinationStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, destUploadDir);
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'destination-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const destinationFileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};
const uploadDestinationImage = multer({ storage: destinationStorage, fileFilter: destinationFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Get all active destinations (public)
router.get("/destinations", async (_req, res) => {
  try {
    const destinations = await Destination.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Admin routes for destination management
// Get all destinations for admin
router.get("/admin/destinations", async (_req, res) => {
  try {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create new destination
router.post("/admin/destinations", uploadDestinationImage.single('image'), async (req, res) => {
  try {
    const { name, description, region, type, price } = req.body;

    if (!name || !description || !region || !type || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const imagePath = `/uploads/${req.file.filename}`;

    const destination = new Destination({ 
      name, 
      description, 
      image: imagePath, 
      region, 
      type, 
      price,
      createdBy: 'admin'
    });
    
    await destination.save();
    res.status(201).json({ message: "Destination created successfully", destination });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update destination
router.put("/admin/destinations/:id", uploadDestinationImage.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, region, type, price, status } = req.body;

    const update = { name, description, region, type, price, status };
    if (req.file) {
      update.image = `/uploads/${req.file.filename}`;
    }

    const destination = await Destination.findByIdAndUpdate(
      id,
      update,
      { new: true }
    );

    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }

    res.json({ message: "Destination updated successfully", destination });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete destination
router.delete("/admin/destinations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const destination = await Destination.findByIdAndDelete(id);
    
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    res.json({ message: "Destination deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Toggle destination status
router.patch("/admin/destinations/:id/toggle", async (req, res) => {
  try {
    const { id } = req.params;
    
    const destination = await Destination.findById(id);
    if (!destination) {
      return res.status(404).json({ message: "Destination not found" });
    }
    
    destination.status = destination.status === 'active' ? 'inactive' : 'active';
    await destination.save();
    
    res.json({ message: `Destination ${destination.status}`, destination });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;



