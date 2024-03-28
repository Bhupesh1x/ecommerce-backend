import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  createProduct,
  getCategories,
  getLatestProducts,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create", isAdmin, createProduct);
router.get("/latest", getLatestProducts);
router.get("/categories", getCategories);

export default router;
