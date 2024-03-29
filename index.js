import cors from "cors";
import express from "express";
import NodeCache from "node-cache";
import cookieParser from "cookie-parser";

import "dotenv/config";

import { connectDB } from "./utils/features.js";

// api routes
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";

connectDB();

export const cache = new NodeCache();

const port = process.env.PORT;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// api routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
