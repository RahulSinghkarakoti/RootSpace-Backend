import express from "express";
import { apiLimiter } from "../../middleware/rateLimiter.js";
import dashboardCtrl from "./dashboard.controller.js";

const router = express.Router();

// Get complete dashboard data
router.get("/", apiLimiter, dashboardCtrl.getDashboardData);

export default router;
