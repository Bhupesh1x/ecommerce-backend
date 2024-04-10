import User from "../models/user.js";
import Order from "../models/order.js";
import Product from "../models/product.js";

import { cache } from "../index.js";
import { calculatePercent, errorMessage } from "../utils/features.js";

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
        const monthDifference = order.createdAt?.getMonth() - today.getMonth();

        if (monthDifference < 6) {
          orderMonthlyCount[6 - monthDifference - 1] += 1;
          orderMonthlyRevenue[6 - monthDifference - 1] += order.total;
        }
      });

      const categoriesCountPromise = categories.map((category) =>
        Product.countDocuments({ category })
      );

      const categoriesCount = await Promise.all(categoriesCountPromise);

      const categoryCount = [];
      categories.forEach((category, i) => {
        categoryCount.push({
          [category]: Math.round((categoriesCount[i] / productCount) * 100),
        });
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

export { getDashboardStats };
