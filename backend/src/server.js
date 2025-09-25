require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboard");
const guideRoutes = require("./routes/guideRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const ruralRoutes = require("./routes/ruralRoutes");
const chatRoutes = require("./routes/chatRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const packageRoutes = require("./routes/packageRoutes");

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

// Serve uploaded files (support both legacy and current paths)
const uploadsDirLegacy = path.resolve(__dirname, "../uploads"); // backend/uploads
const uploadsDirCurrent = path.resolve(__dirname, "./uploads"); // backend/src/uploads
app.use('/uploads', express.static(uploadsDirCurrent));
app.use('/uploads', express.static(uploadsDirLegacy));
console.log("Serving frontend from:", frontendDir);
console.log("Serving uploads (current) from:", uploadsDirCurrent);
console.log("Serving uploads (legacy) from:", uploadsDirLegacy);

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
app.use("/api", ruralRoutes);
app.use("/api", chatRoutes);
app.use("/api", paymentRoutes);
app.use("/api/packages", packageRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
