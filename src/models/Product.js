const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  type: { type: String, required: true },
  countInStock: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model("Product", productSchema);
