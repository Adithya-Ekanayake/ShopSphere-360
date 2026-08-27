const express = require("express");
const { reportValidation } = require("../middleware/validation");

const {
  getSalesReport,
  getRevenueProfitReport,
  getCustomerReport,
  getProductReport,
  getTransactionReport,
} = require("../controllers/reportsController");

const router = express.Router();

// ==========================================================
// SALES
// ==========================================================

router.get(
  "/sales",
  reportValidation,
  getSalesReport
);

// ==========================================================
// REVENUE & PROFIT
// ==========================================================

router.get(
  "/revenue-profit",
  reportValidation,
  getRevenueProfitReport
);

// ==========================================================
// CUSTOMERS
// ==========================================================

router.get(
  "/customers",
  reportValidation,
  getCustomerReport
);

// ==========================================================
// PRODUCTS
// ==========================================================

router.get(
  "/products",
  reportValidation,
  getProductReport
);

// ==========================================================
// TRANSACTIONS
// ==========================================================

router.get(
  "/transactions",
  reportValidation,
  getTransactionReport
);

module.exports = router;