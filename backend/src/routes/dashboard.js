const express = require("express");
const router = express.Router();
const { getDashboardData, createDashboardRecord, updateDashboardRecord, deleteDashboardRecord } = require("../controllers/index");

// Define routes
router.get("/dashboard", getDashboardData);
router.post("/dashboard", createDashboardRecord);
router.put("/dashboard/:id", updateDashboardRecord);
router.delete("/dashboard/:id", deleteDashboardRecord);

module.exports = router;
