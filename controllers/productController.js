const Product = require('../models/Product');

// Lấy toàn bộ sản phẩm
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  const newProduct = new Product(req.body);
  const saved = await newProduct.save();
  res.status(201).json(saved);
};
