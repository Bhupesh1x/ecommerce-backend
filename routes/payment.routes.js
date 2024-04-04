import express from "express";

import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  applyDiscount,
  createCoupon,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-coupon", isAdmin, createCoupon);
router.get("/apply-discount", isAuthenticated, applyDiscount);

export default router;
