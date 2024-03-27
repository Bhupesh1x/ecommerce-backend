import jwt from "jsonwebtoken";

import { errorMessage } from "../utils/features.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies["ecommerce-token"];

    if (!token) {
      return errorMessage(res, "User not authenticates", 400);
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return errorMessage(res, "User not authenticates", 400);
    }

    req.user = { userId: decode.userId, role: decode.role };

    next();
  } catch (error) {
    console.log("isAuthenticated error", error);
    return errorMessage(res);
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.cookies["ecommerce-token"];

    if (!token) {
      return errorMessage(res, "User not authenticated", 400);
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    if (!decode) {
      return errorMessage(res, "User not authenticated", 401);
    }

    if (decode.role !== "Admin") {
      return errorMessage(res, "User not authenticated", 401);
    }

    req.user = { userId: decode.userId, role: decode.role };

    next();
  } catch (error) {
    console.log("isAdmin error", error);
    return errorMessage(res);
  }
};
