require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboard");
const guideRoutes = require("./routes/guideRoutes");
const destinationRoutes = require("./routes/destinationRoutes");

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
app.use('/js', express.static(path.join(frontendDir, 'js')));
console.log("Serving frontend from:", frontendDir);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Root route - redirect to login
app.get("/", (req, res) => {
  res.redirect("/login.html");
});

// Explicit route for contact page (in case static resolution fails)
app.get("/contact.html", (req, res) => {
  const filePath = path.join(frontendDir, "contact.html");
  res.sendFile(filePath);
});

// Routes

console.log("Booking router loaded at /book");
const bookingRouter = require("../booking.js");
app.use("/book", bookingRouter);
app.use("/api", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", guideRoutes);
app.use("/api", destinationRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
