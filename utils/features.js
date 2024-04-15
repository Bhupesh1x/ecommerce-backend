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

export const invalidateCache = ({
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

  const keys = [
    "dasboard-stats",
    "admin-pie-charts",
    "admin-bar-charts",
    "admin-line-charts",
  ];

  cache.del(keys);
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

  const percent = (thisMonth / lastMonth) * 100;
  return percent.toFixed(0);
};

export const getInventories = async ({ categories, productCount }) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount = [];
  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productCount) * 100),
    });
  });

  return categoryCount;
};

export const getChartData = ({ length, docArr, today }) => {
  const data = new Array(length).fill(0);

  docArr.forEach((elem) => {
    const monthDifference =
      (today.getMonth() - elem.createdAt?.getMonth() + 12) % 12;

    if (monthDifference < length) {
      data[length - monthDifference - 1] += 1;
    }
  });

  return data;
};
