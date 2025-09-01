require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
const frontendDir = path.resolve(__dirname, "../../frontend");
app.use(express.static(frontendDir));
console.log("Serving frontend from:", frontendDir);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root route - serve dashboard or show message
app.get("/", (req, res) => {
  const dashboardPath = path.join(frontendDir, "dashboard.html");
  res.sendFile(dashboardPath);
});

// Explicit route for contact page (in case static resolution fails)
app.get("/contact.html", (req, res) => {
  const filePath = path.join(frontendDir, "contact.html");
  res.sendFile(filePath);
});

// Routes
app.use("/api", authRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
