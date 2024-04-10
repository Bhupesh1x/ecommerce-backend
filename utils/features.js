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

export const invalidateCache = async ({
  product,
  order,
  userId,
  orderId,
  productId,
}) => {
  if (product) {
    const keys = ["latest-products", "categories", "admin-products"];

    if (typeof productId === "string") keys.push(`product-${productId}`);

    if (typeof productId === "object") {
      productId.forEach((element) => {
        keys.push(`product-${element}`);
      });
    }

    cache.del(keys);
  }

  if (order) {
    const keys = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];

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

export const calculatePercent = (thisMonth, lastMonth) => {
  if (lastMonth === 0) return thisMonth * 100;

  const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return percent.toFixed(0);
};
