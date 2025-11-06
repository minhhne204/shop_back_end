const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/get-All", productController.getAllProduct);
router.post("/create", productController.createProduct);
router.put("/update/:id", productController.updateProduct);
router.get("/get-details/:id", productController.getProductDetail);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
