import express from "express";

import {
  allUsers,
  deleteUser,
  getUser,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/all", isAdmin, allUsers);
router.get("/logout", logout);

router.get("/:id", isAuthenticated, getUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;
