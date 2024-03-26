import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUserExist = await User.findOne({ email });

    if (!isUserExist) {
      return errorMessage(res, "Invalid credentials", 401);
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      isUserExist.password
    );

    if (!isPasswordCorrect) {
      return errorMessage(res, "Invalid credentials", 401);
    }

    const token = await jwt.sign(
      { userId: isUserExist._id, role: isUserExist?.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    isUserExist.password = undefined;

    return res
      .cookie("ecommerce-toke", token, {
        expiresIn: "1d",
      })
      .json(isUserExist);
  } catch (error) {
    console.log("login-error", error);
    return errorMessage(res);
  }
};

const allUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.json(users);
  } catch (error) {
    console.log("allUsers-error", error);
    return errorMessage(res);
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return errorMessage(res, "Invalid Id", 401);
    }

    return res.json(user);
  } catch (error) {
    console.log("getUser-error", error);
    return errorMessage(res);
  }
};

export { register, login, allUsers, getUser };
