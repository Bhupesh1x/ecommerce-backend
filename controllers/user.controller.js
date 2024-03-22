import bcrypt from "bcryptjs";

import User from "../models/user.js";
import { errorMessage } from "../utils/features.js";

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return errorMessage(res, "User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ ...req.body, password: hashedPassword });

    return res.status(201).json({
      message: "User registered successfully",
      success: true,
    });
  } catch (error) {
    console.log("register-error", error);
    return errorMessage(res);
  }
};

export { register };
