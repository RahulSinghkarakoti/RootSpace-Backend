import dashboardService from "../services/dashboard.service.js";
import {
  sendSuccess,
  sendError,
} from "../utils/response.js";

const getDashboardData = async (req, res) => {
  try {
    const result = await dashboardService.getDashboardData(req);
    sendSuccess(res, "Dashboard data fetched successfully", result);
  } catch (error) {
    sendError(res, error.message || "Failed to fetch dashboard data", 500);
  }
};

export default {
  getDashboardData,
};
