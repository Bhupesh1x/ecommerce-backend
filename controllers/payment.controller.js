import { stripe } from "../index.js";
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

const allCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();

    return res.json(coupons);
  } catch (error) {
    console.log("allCoupon-error", error);
    return errorMessage(res);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return errorMessage(res, "Coupon not found", 400);
    }

    await coupon.deleteOne();

    return res.json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.log("deleteCoupon-error", error);
    return errorMessage(res);
  }
};

const createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return errorMessage(res, "Please enter amount", 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
    });
    return res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return errorMessage(res);
  }
};

export { createCoupon, applyDiscount, allCoupons, deleteCoupon, createPayment };
