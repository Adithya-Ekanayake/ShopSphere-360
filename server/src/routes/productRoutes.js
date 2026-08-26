const express = require("express");

const {
  getProducts,
  getProductByKey,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

// GET /products
router.get("/", getProducts);

// GET /products/:productKey
router.get("/:productKey", getProductByKey);

// POST /products
router.post("/", createProduct);

// PUT /products/:productKey
router.put("/:productKey", updateProduct);

// DELETE /products/:productKey
router.delete("/:productKey", deleteProduct);

module.exports = router;