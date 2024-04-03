import express from "express";

import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  allOrders,
  createOrder,
  myOrders,
  orderDetails,
  processOrder,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, createOrder);
router.get("/my-orders", isAuthenticated, myOrders);
router.get("/all-orders", isAdmin, allOrders);
router.get("/:id", isAuthenticated, orderDetails);
router.put("/process/:id", isAdmin, processOrder);

export default router;
