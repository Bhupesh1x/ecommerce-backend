import Product from "../models/product.js";
import { errorMessage } from "../utils/features.js";

const createProduct = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, imageUrl, price, stock, category } = req.body;

    if (!name || !imageUrl || !price || !stock || !category) {
      return errorMessage(res, "Missing required fields", 400);
    }

    const product = await Product.create({
      ...req.body,
      category: category.toLowerCase(),
      seller: userId,
    });

    return res.json(product);
  } catch (error) {
    console.log("createProduct-error", error);
    return errorMessage(res);
  }
};

export { createProduct };
