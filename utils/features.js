import mongoose from "mongoose";

import "dotenv/config";

import { cache } from "../index.js";
import Product from "../models/product.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to mongodb");
  } catch (error) {
    console.log("MongoDb connection error", error);
  }
};

export const errorMessage = (res, error, statusCode) => {
  return res.status(statusCode || 500).json({
    message: error || "Something went wrong",
    success: false,
  });
};

export const invalidateCache = async ({ product, order }) => {
  if (product) {
    const keys = ["latest-products", "categories", "admin-products"];

    const products = await Product.find({}).select("_id");

    products.forEach((element) => {
      keys.push(`product-${element._id}`);
    });

    cache.del(keys);
  }
};

export const reduceProductStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];

    const product = await Product.findById(order.productId);

    product.stock -= order.quantity;

    await product.save();
  }
};
