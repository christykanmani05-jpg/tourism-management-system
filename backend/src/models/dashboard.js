const mongoose = require("mongoose");

const dashboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Dashboard = mongoose.model("Dashboard", dashboardSchema);

module.exports = {
  Dashboard,
};
