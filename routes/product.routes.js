import express from "express";
import { createProduct } from "../controllers/product.controller.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create", isAdmin, createProduct);

export default router;
