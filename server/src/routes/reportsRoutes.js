const express = require("express");

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
  getSalesReport
);

// ==========================================================
// REVENUE & PROFIT
// ==========================================================

router.get(
  "/revenue-profit",
  getRevenueProfitReport
);

// ==========================================================
// CUSTOMERS
// ==========================================================

router.get(
  "/customers",
  getCustomerReport
);

// ==========================================================
// PRODUCTS
// ==========================================================

router.get(
  "/products",
  getProductReport
);

// ==========================================================
// TRANSACTIONS
// ==========================================================

router.get(
  "/transactions",
  getTransactionReport
);

module.exports = router;