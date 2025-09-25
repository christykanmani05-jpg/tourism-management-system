const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true }, // e.g., "5 Days / 4 Nights"
    price: { type: String, required: true, trim: true }, // e.g., "₹95,000 per couple"
    features: [{ type: String, trim: true }], // Array of features/inclusions
    destination: { type: String, required: true, trim: true }, // Main destination
    category: { type: String, required: true, trim: true }, // e.g., "honeymoon", "adventure", "cultural"
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
