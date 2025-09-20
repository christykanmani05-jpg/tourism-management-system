const mongoose = require("mongoose");

const ruralPlaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    price: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdBy: { type: String, default: 'admin' }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RuralPlace", ruralPlaceSchema);
