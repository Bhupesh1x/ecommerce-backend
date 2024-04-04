import Coupon from "../models/coupon.js";
import { errorMessage } from "../utils/features.js";

const createCoupon = async (req, res) => {
  try {
    const { coupon, amount } = req.body;

    if (!coupon?.trim() || !amount) {
      return errorMessage(res, "please enter all thee required fields");
    }

    await Coupon.create({ coupon, amount });

    return res.status(201).json({
      success: true,
      message: `Coupon ${coupon} created successfully`,
    });
  } catch (error) {
    return errorMessage(res);
  }
};

const applyDiscount = async (req, res) => {
  try {
    const { coupon } = req.query;

    if (!coupon?.trim()) {
      return errorMessage(res, "Missing required fields", 400);
    }

    const discount = await Coupon.findOne({ coupon });

    if (!discount) {
      return errorMessage(res, "Invalid coupon code", 400);
    }

    return res.json({
      success: true,
      discount: discount.amount,
    });
  } catch (error) {
    console.log("applyDiscount-error", error);
    return errorMessage(res);
  }
};

export { createCoupon, applyDiscount };
