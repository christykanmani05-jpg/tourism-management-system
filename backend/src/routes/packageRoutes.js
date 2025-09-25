const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Package = require("../models/Package");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "package-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all packages (public)
router.get("/", async (req, res) => {
  try {
    const packages = await Package.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages", error: error.message });
  }
});

// Get all packages for admin (including inactive)
router.get("/admin", async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.json(packages);
  } catch (error) {
    res.status(500).json({ message: "Error fetching packages", error: error.message });
  }
});

// Get single package
router.get("/:id", async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.json(package);
  } catch (error) {
    res.status(500).json({ message: "Error fetching package", error: error.message });
  }
});

// Create new package (admin only)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, description, duration, price, features, destination, category } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Parse features if it's a string
    let featuresArray = [];
    if (features) {
      if (typeof features === 'string') {
        featuresArray = features.split(',').map(f => f.trim()).filter(f => f);
      } else if (Array.isArray(features)) {
        featuresArray = features;
      }
    }

    const newPackage = new Package({
      name,
      description,
      image: `/uploads/${req.file.filename}`,
      duration,
      price,
      features: featuresArray,
      destination,
      category,
      createdBy: 'admin'
    });

    await newPackage.save();
    res.status(201).json({ message: "Package created successfully", package: newPackage });
  } catch (error) {
    res.status(500).json({ message: "Error creating package", error: error.message });
  }
});

// Update package (admin only)
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, description, duration, price, features, destination, category, status } = req.body;
    
    const updateData = {
      name,
      description,
      duration,
      price,
      features: typeof features === 'string' ? features.split(',').map(f => f.trim()).filter(f => f) : features,
      destination,
      category,
      status
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package updated successfully", package: updatedPackage });
  } catch (error) {
    res.status(500).json({ message: "Error updating package", error: error.message });
  }
});

// Toggle package status (admin only)
router.patch("/:id/toggle", async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }

    package.status = package.status === 'active' ? 'inactive' : 'active';
    await package.save();

    res.json({ 
      message: `Package ${package.status} successfully`, 
      package: package 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating package status", error: error.message });
  }
});

// Delete package (admin only)
router.delete("/:id", async (req, res) => {
  try {
    const deletedPackage = await Package.findByIdAndDelete(req.params.id);
    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting package", error: error.message });
  }
});

module.exports = router;
