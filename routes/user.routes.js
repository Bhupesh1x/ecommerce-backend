import express from "express";

import {
  allUsers,
  deleteUser,
  getUser,
  login,
  register,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/all", allUsers);
router.get("/:id", getUser);
router.delete("/:id", deleteUser);

export default router;
