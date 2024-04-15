import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  getBarChartStats,
  getDashboardStats,
  getLineChartStats,
  getPieChartStats,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", isAdmin, getDashboardStats);
router.get("/pie-chart-stats", isAdmin, getPieChartStats);
router.get("/bar-chart-stats", isAdmin, getBarChartStats);
router.get("/line-chart-stats", isAdmin, getLineChartStats);

export default router;
