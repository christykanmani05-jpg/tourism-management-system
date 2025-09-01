const express = require("express");
const router = express.Router();
const { getDashboardData, createDashboardData, updateDashboardData, deleteDashboardData } = require("../controllers/index");

// Define routes
router.get("/dashboard", getDashboardData);
router.post("/dashboard", createDashboardData);
router.put("/dashboard/:id", updateDashboardData);
router.delete("/dashboard/:id", deleteDashboardData);

// Export the router
module.exports = router;