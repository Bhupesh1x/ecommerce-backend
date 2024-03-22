import cors from "cors";
import express from "express";

import "dotenv/config";

// api routes
import userRoutes from "./routes/user.routes.js";
import { connectDB } from "./utils/features.js";

connectDB();

const port = process.env.PORT;

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// api routes
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
