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

const getLatestProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    return res.json(products);
  } catch (error) {
    console.log("getLatestProducts-error", error);
    return errorMessage(res);
  }
};

const getCategories = async (req, res) => {
  try {
    const category = await Product.distinct("category");
    return res.json(category);
  } catch (error) {
    console.log("getCategories-error", error);
    return errorMessage(res);
  }
};

const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find();
    return res.json(products);
  } catch (error) {
    console.log("getAdminProducts-error", error);
    return errorMessage(res);
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const isProductExist = await Product.findById(id);

    if (!isProductExist) {
      return errorMessage(res, "Invalid id", 400);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true }
    );

    return res.json(product);
  } catch (error) {
    console.log("updateProduct-error", error);
    return errorMessage(res);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const isProductExist = await Product.findById(id);

    if (!isProductExist) {
      return errorMessage(res, "Invalid id", 400);
    }

    await Product.findByIdAndDelete(id);

    return res.json({
      message: "Product deleted successfully",
      success: true,
    });
  } catch (error) {
    console.log("deleteProduct-error", error);
    return errorMessage(res);
  }
};

const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return errorMessage(res, "Product not found", 404);
    }

    return res.json(product);
  } catch (error) {
    console.log("getSingleProduct-error", error);
    return errorMessage(res);
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = (page - 1) * limit;

    const baseQuery = {};

    if (search) {
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      baseQuery.category = category;
    }

    if (price) {
      baseQuery.price = {
        $lte: Number(price),
      };
    }

    const productsPromise = Product.find(baseQuery)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
      .limit(limit)
      .skip(skip);

    const [products, filteredProducts] = await Promise.all([
      productsPromise,
      Product.find(baseQuery),
    ]);

    const totalPages = Math.ceil(filteredProducts?.length / limit);

    return res.json({
      products,
      totalPages,
      page,
    });
  } catch (error) {
    console.log("getAllProducts-error", error);
    return errorMessage(res);
  }
};

export {
  createProduct,
  getLatestProducts,
  getCategories,
  getAdminProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
  getAllProducts,
};
