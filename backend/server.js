const express = require("express");
const cors = require("cors");
const guideRoutes = require("./guide");
const bookingRoutes = require("./booking");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", guideRoutes);
app.use("/api", bookingRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
