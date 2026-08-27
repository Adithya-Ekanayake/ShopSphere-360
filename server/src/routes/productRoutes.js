const express = require("express");

const {
  getProducts,
  getProductByKey,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");
const { productValidation, positiveParam, filterValidation } = require("../middleware/validation");

const router = express.Router();

// Read — any authenticated user
router.get("/", requireAuth, filterValidation, getProducts);
router.get("/:productKey", requireAuth, positiveParam("productKey"), getProductByKey);

// Write — Admin or Manager only
router.post("/", requireAuth, requireRole("Admin", "Manager"), productValidation(), createProduct);
router.put("/:productKey", requireAuth, requireRole("Admin", "Manager"), positiveParam("productKey"), productValidation(true), updateProduct);
router.delete("/:productKey", requireAuth, requireRole("Admin", "Manager"), positiveParam("productKey"), deleteProduct);

module.exports = router;