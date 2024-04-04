import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import { createCoupon } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-coupon", isAdmin, createCoupon);

export default router;
