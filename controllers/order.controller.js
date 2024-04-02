import Order from "../models/order.js";
import {
  errorMessage,
  invalidateCache,
  reduceProductStock,
} from "../utils/features.js";

const createOrder = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    await Order.create({
      shippingInfo,
      orderItems,
      user: req.user.userId,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });

    await reduceProductStock(orderItems);

    await invalidateCache({ product: true, order: true });

    return res.status(201).json({
      message: "Order created successfully",
      success: true,
    });
  } catch (error) {
    return errorMessage(res);
  }
};

export { createOrder };
