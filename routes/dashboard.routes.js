import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  getDashboardStats,
  getPieChartStats,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", isAdmin, getDashboardStats);
router.get("/pie-chart-stats", isAdmin, getPieChartStats);

export default router;
