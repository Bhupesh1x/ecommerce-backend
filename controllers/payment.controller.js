import Coupon from "../models/coupon.js";
import { errorMessage } from "../utils/features.js";

const createCoupon = async (req, res) => {
  try {
    const { coupon, amount } = req.body;

    if (!coupon.trim() || !amount) {
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

export { createCoupon };
