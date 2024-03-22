import mongoose from "mongoose";

import "dotenv/config";

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
