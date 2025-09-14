const mongoose = require("mongoose");

const guideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    destination: { type: String, required: true, trim: true },
    languages: [{ type: String, trim: true }],
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guide", guideSchema);