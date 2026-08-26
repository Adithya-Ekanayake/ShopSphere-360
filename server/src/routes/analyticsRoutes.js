const express = require("express");

const {
  getKPIs,
  getMonthlySales,
  getTopProducts,
  getCustomerAnalytics,
  getMarketingAnalytics,
  getReturnsAnalytics,
  getSupportAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

// ==========================================
// SALES
// ==========================================

router.get("/kpis", getKPIs);

router.get("/monthly-sales", getMonthlySales);

// ==========================================
// PRODUCTS
// ==========================================

router.get("/top-products", getTopProducts);

// ==========================================
// CUSTOMERS
// ==========================================

router.get("/customers", getCustomerAnalytics);

// ==========================================
// MARKETING
// ==========================================

router.get("/marketing", getMarketingAnalytics);

// ==========================================
// RETURNS
// ==========================================

router.get("/returns", getReturnsAnalytics);

// ==========================================
// SUPPORT
// ==========================================

router.get("/support", getSupportAnalytics);

module.exports = router;