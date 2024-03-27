import express from "express";

import {
  allUsers,
  deleteUser,
  getUser,
  login,
  register,
} from "../controllers/user.controller.js";
import { isAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/all", isAdmin, allUsers);
router.get("/:id", getUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;
