import cors from "cors";
import express from "express";
import NodeCache from "node-cache";
import cookieParser from "cookie-parser";

import "dotenv/config";

import { connectDB } from "./utils/features.js";

// api routes
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import Stripe from "stripe";

connectDB();

const stripeKey = process.env.STRIPE_KEY || "";

export const cache = new NodeCache();
export const stripe = new Stripe(stripeKey);

const port = process.env.PORT;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// api routes
app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/product", productRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
