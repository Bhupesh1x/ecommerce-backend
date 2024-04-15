import express from "express";

import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  allCoupons,
  applyDiscount,
  createCoupon,
  createPayment,
  deleteCoupon,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create", createPayment);
router.post("/create-coupon", isAdmin, createCoupon);
router.get("/apply-discount", isAuthenticated, applyDiscount);
router.get("/all-coupons", isAdmin, allCoupons);
router.delete("/coupon/:id", isAdmin, deleteCoupon);

export default router;
