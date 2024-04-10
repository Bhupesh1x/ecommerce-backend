import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", isAdmin, getDashboardStats);

export default router;
