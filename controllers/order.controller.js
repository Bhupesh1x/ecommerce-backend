import { cache } from "../index.js";
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

const myOrders = async (req, res) => {
  try {
    const { userId } = req.user;

    const key = `my-orders-${userId}`;

    let orders;

    if (cache.has(key)) {
      orders = JSON.parse(cache.get(key));
    } else {
      orders = await Order.find({ user: userId });
      cache.set(key, JSON.stringify(orders));
    }

    return res.json(orders);
  } catch (error) {
    return errorMessage(res);
  }
};

const allOrders = async (req, res) => {
  try {
    let orders;

    const key = "all-orders";

    if (cache.has(key)) {
      orders = JSON.parse(cache.get(key));
    } else {
      orders = await Order.find().populate("user", "name _id");
      cache.set(key, JSON.stringify(orders));
    }

    return res.json(orders);
  } catch (error) {
    return errorMessage(res);
  }
};

const orderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const key = `order-${id}`;

    let order;

    if (cache.has(key)) {
      order = JSON.parse(cache.get(key));
    } else {
      order = await Order.findById(id).populate("user", "_id name");

      if (!order) {
        return errorMessage(res, "Order not found", 404);
      }

      cache.set(key, JSON.stringify(order));
    }

    return res.json(order);
  } catch (error) {
    return errorMessage(res);
  }
};

const processOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return errorMessage(res, "Order not found", 404);
    }

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }

    await order.save();

    await invalidateCache({ product: false, order: true });

    return res.json({
      success: true,
      message: "Order processed successfully",
    });
  } catch (error) {
    return errorMessage(res);
  }
};

export { createOrder, myOrders, allOrders, orderDetails, processOrder };
