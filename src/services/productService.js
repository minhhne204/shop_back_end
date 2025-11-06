const Product = require("../models/Product");

const getAllProduct = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const allProduct = await Product.find();
      resolve({
        status: "ok",
        message: "Get all products successfully",
        data: allProduct,
      });
    } catch (error) {
      reject({
        status: "error",
        message: "Failed to get all products",
        error: error.message,
      });
    }
  });
};

const createProduct = (newProduct) => {
  return new Promise(async (resolve, reject) => {
    const { name, price, image, description } = newProduct;
    try {
      const checkProduct = await Product.findOne({ name: name });
      if (checkProduct != null) {
        resolve({ status: "ok", message: "The name of product is already" });
      }
      const newProduct = await Product.create({
        name,
        price,
        image,
        description,
      });
      if (newProduct) {
        resolve({
          status: "ok",
          message: "Create product successfully",
          data: newProduct,
        });
      }
    } catch (error) {
      reject({
        status: "error",
        message: "Failed to create product",
        error: error.message,
      });
    }
  });
};

const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({ _id: id });
      if (!checkProduct === null) {
        return resolve({ status: "ok", message: "Product not found" });
      }
      const updatedProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      resolve({
        status: "ok",
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      reject({
        status: "error",
        message: "Failed to update product",
        error: error.message,
      });
    }
  });
};

const getProductDetail = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findOne({ _id: id });
      if (product === null) {
        return resolve({ status: "ok", message: "Product not found" });
      }
      resolve({ status: "ok", message: "Product found", data: product });
    } catch (error) {
      reject({
        status: "error",
        message: "Failed to get product detail",
        error: error.message,
      });
    }
  });
};

const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({ _id: id });
      if (!checkProduct) {
        return resolve({ status: "ok", message: "Product not found" });
      }
      await Product.findByIdAndDelete(id);
      resolve({ status: "ok", message: "Product deleted successfully" });
    } catch (error) {
      reject({
        status: "error",
        message: "Failed to delete product",
        error: error.message,
      });
    }
  });
};

module.exports = {
  getAllProduct,
  createProduct,
  updateProduct,
  getProductDetail,
  deleteProduct,
};
