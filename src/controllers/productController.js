const Product = require("../models/Product");
const productService = require("../services/productService");

// Lấy toàn bộ sản phẩm
const getAllProduct = async (req, res) => {
  try {
    const response = await productService.getAllProduct();
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
  try {
    const { name, price, image, description } = req.body;
    if (!name || !price || !image || !description) {
      return res.status(200).json({
        status: "error",
        message: "The input is required.",
      });
    }
    const response = await productService.createProduct(req.body);
    return res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }
    const response = await productService.updateProduct(productId, data);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// Lấy chi tiết sản phẩm
const getProductDetail = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }
    const response = await productService.getProductDetail(productId);

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

// Xóa sản phẩm

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }
    const response = await productService.deleteProduct(productId);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = {
  getAllProduct,
  createProduct,
  updateProduct,
  getProductDetail,
  deleteProduct,
};
