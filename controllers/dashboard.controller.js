import User from "../models/user.js";
import Order from "../models/order.js";
import Product from "../models/product.js";

import { cache } from "../index.js";
import {
  calculatePercent,
  errorMessage,
  getChartData,
  getInventories,
} from "../utils/features.js";

const getDashboardStats = async (req, res) => {
  try {
    let stats;
    const key = "dasboard-stats";

    if (cache.has(key)) {
      stats = JSON.parse(cache.get(key));
    } else {
      const today = new Date();
      const thisMonth = {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today,
      };
      const lastMonth = {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth(), 0),
      };

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const thisMonthProductsPromise = Product.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthProductsPromise = Product.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const thisMonthUsersPromise = User.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthUsersPromise = User.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const thisMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: thisMonth.start,
          $lte: thisMonth.end,
        },
      });

      const lastMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: lastMonth.start,
          $lte: lastMonth.end,
        },
      });

      const lastSixMonthOrdersPromise = Order.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      });

      const latestTransactionsPromise = Order.find({})
        .select(["total", "discount", "status", "orderItems"])
        .limit(5);

      const [
        thisMonthUsers,
        lastMonthUsers,
        thisMonthOrders,
        lastMonthOrders,
        thisMonthProducts,
        lastMonthProducts,
        productCount,
        userCount,
        allOrders,
        lastSixMonthOrders,
        categories,
        femaleUsersCount,
        latestTransactions,
      ] = await Promise.all([
        thisMonthUsersPromise,
        lastMonthUsersPromise,
        thisMonthOrdersPromise,
        lastMonthOrdersPromise,
        thisMonthProductsPromise,
        lastMonthProductsPromise,
        Product.countDocuments(),
        User.countDocuments(),
        Order.find().select("total"),
        lastSixMonthOrdersPromise,
        Product.distinct("category"),
        User.countDocuments({ gender: "Female" }),
        latestTransactionsPromise,
      ]);

      const thisMonthRevenue = thisMonthOrders.reduce(
        (acc, curr) => acc + (curr.total || 0),
        0
      );

      const lastMonthRevenue = lastMonthOrders.reduce(
        (acc, curr) => acc + (curr.total || 0),
        0
      );

      const totalRevenue = allOrders.reduce(
        (acc, curr) => acc + (curr.total || 0),
        0
      );

      const revenuePercent = calculatePercent(
        thisMonthRevenue,
        lastMonthRevenue
      );

      const userChangePercent = calculatePercent(
        thisMonthUsers.length,
        lastMonthUsers.length
      );
      const orderChangePercent = calculatePercent(
        thisMonthOrders.length,
        lastMonthOrders.length
      );
      const productChangePercent = calculatePercent(
        thisMonthProducts.length,
        lastMonthProducts.length
      );

      const count = {
        product: productCount,
        user: userCount,
        order: allOrders?.length,
        totalRevenue,
      };

      const percent = {
        userChangePercent,
        orderChangePercent,
        productChangePercent,
        revenuePercent,
      };

      const orderMonthlyCount = new Array(6).fill(0);
      const orderMonthlyRevenue = new Array(6).fill(0);

      lastSixMonthOrders.forEach((order) => {
        const monthDifference =
          (today.getMonth() - order.createdAt?.getMonth() + 12) % 12;

        if (monthDifference < 6) {
          orderMonthlyCount[6 - monthDifference - 1] += 1;
          orderMonthlyRevenue[6 - monthDifference - 1] += order.total;
        }
      });

      const categoryCount = await getInventories({
        categories,
        productCount,
      });

      const usersGenderRatio = {
        male: userCount - femaleUsersCount,
        female: femaleUsersCount,
      };

      stats = {
        percent,
        count,
        chart: {
          order: orderMonthlyCount,
          revenue: orderMonthlyRevenue,
        },
        categoryCount,
        usersGenderRatio,
        latestTransactions,
      };

      cache.set(key, JSON.stringify(stats));
    }

    return res.json(stats);
  } catch (error) {
    console.log("getDashboardStats-error", error);
    return errorMessage(res);
  }
};

const getPieChartStats = async (req, res) => {
  try {
    let key = "admin-pie-charts";
    let charts;

    if (cache.has(key)) {
      charts = JSON.parse(cache.get(key));
    } else {
      const allOrdersPromise = Order.find().select([
        "tax",
        "discount",
        "shippingCharges",
        "total",
      ]);

      const [
        processingOrders,
        shippedOrders,
        deliveredOrders,
        categories,
        productCount,
        productsOutOfStock,
        allOrders,
        allUsers,
        customerUsers,
        adminUsers,
      ] = await Promise.all([
        Order.countDocuments({ status: "Processing" }),
        Order.countDocuments({ status: "Shipped" }),
        Order.countDocuments({ status: "Delivered" }),
        Product.distinct("category"),
        Product.countDocuments(),
        Product.countDocuments({ stock: 0 }),
        allOrdersPromise,
        User.find().select("+dob"),
        User.countDocuments({ role: "User" }),
        User.countDocuments({ role: "Admin" }),
      ]);

      const productCategories = await getInventories({
        categories,
        productCount,
      });

      const orderFullfilment = {
        processingOrders,
        shippedOrders,
        deliveredOrders,
      };

      const stocksAvailability = {
        inStock: productCount - productsOutOfStock,
        OutOfStock: productsOutOfStock,
      };

      const grossIncome = allOrders.reduce(
        (acc, curr) => (acc += curr.total || 0),
        0
      );

      const discount = allOrders.reduce(
        (acc, curr) => (acc += curr.discount || 0),
        0
      );

      const productionCost = allOrders.reduce(
        (acc, curr) => (acc += curr.shippingCharges || 0),
        0
      );

      const burnt = allOrders.reduce((acc, curr) => (acc += curr.tax || 0), 0);

      const marketingCost = (grossIncome * 30) / 100;

      const netMargin =
        grossIncome - discount - productionCost - burnt - marketingCost;

      const revenueDistribution = {
        netMargin,
        discount,
        productionCost,
        burnt,
        marketingCost,
      };

      const usersAgeGroup = {
        teen: allUsers.filter((i) => i.age < 20)?.length,
        adult: allUsers.filter((i) => i.age > 20 && i.age < 40)?.length,
        old: allUsers.filter((i) => i.age >= 40)?.length,
      };

      const customerDetails = {
        adminUsers,
        customerUsers,
        usersAgeGroup,
      };

      charts = {
        orderFullfilment,
        productCategories,
        stocksAvailability,
        revenueDistribution,
        customerDetails,
      };
      cache.set(key, JSON.stringify(charts));
    }

    return res.json(charts);
  } catch (error) {
    console.log("getPieChartStats-error", error);
    return errorMessage(res);
  }
};

const getBarChartStats = async (req, res) => {
  try {
    let key = "admin-bar-charts";
    let charts;

    if (cache.has(key)) {
      charts = JSON.parse(cache.get(key));
    } else {
      const today = new Date();
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(today.getMonth() - 6);
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(today.getMonth() - 12);

      const sixMonthsProductsPromise = Product.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const sixMonthsUsersPromise = User.find({
        createdAt: {
          $gte: sixMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const twelveMonthsOrdersPromise = Order.find({
        createdAt: {
          $gte: twelveMonthsAgo,
          $lte: today,
        },
      }).select("createdAt");

      const [products, users, orders] = await Promise.all([
        sixMonthsProductsPromise,
        sixMonthsUsersPromise,
        twelveMonthsOrdersPromise,
      ]);

      const productsCount = getChartData({
        length: 6,
        today,
        docArr: products,
      });
      const usersCount = getChartData({ length: 6, today, docArr: users });
      const ordersCount = getChartData({ length: 12, today, docArr: orders });

      charts = {
        products: productsCount,
        users: usersCount,
        orders: ordersCount,
      };
      cache.set(key, JSON.stringify(charts));
    }

    return res.json(charts);
  } catch (error) {
    console.log("getPieChartStats-error", error);
    return errorMessage(res);
  }
};

export { getDashboardStats, getPieChartStats, getBarChartStats };
