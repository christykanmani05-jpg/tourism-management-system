const express = require("express");
const Destination = require("../models/Destination");

const router = express.Router();

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
router.post("/admin/destinations", async (req, res) => {
  try {
    const { name, description, image, region, type, price } = req.body;

    if (!name || !description || !image || !region || !type || !price) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const destination = new Destination({ 
      name, 
      description, 
      image, 
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
router.put("/admin/destinations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, region, type, price, status } = req.body;

    const destination = await Destination.findByIdAndUpdate(
      id,
      { name, description, image, region, type, price, status },
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

