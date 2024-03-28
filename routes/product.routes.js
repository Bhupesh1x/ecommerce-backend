import express from "express";

import { isAdmin } from "../middlewares/auth.js";
import {
  createProduct,
  getAdminProducts,
  getCategories,
  getLatestProducts,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/create", isAdmin, createProduct);
router.get("/latest", getLatestProducts);
router.get("/categories", getCategories);
router.get("/admin-products", isAdmin, getAdminProducts);
router.put("/update/:id", isAdmin, updateProduct);

export default router;
