import express from "express";
import dashboardCtrl from "./dashboard.controller.js";

const router = express.Router();

// Get complete dashboard data
router.get("/", dashboardCtrl.getDashboardData);

export default router;
