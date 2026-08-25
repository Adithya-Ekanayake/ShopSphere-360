const express = require("express");

const {
  getDashboardKPIs,
  getMonthlySales,
  getCustomerAnalytics,
  getProductAnalytics,
  getMarketingAnalytics,
  getReturnsAnalytics,
  getSupportAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/kpis", getDashboardKPIs);
router.get("/monthly-sales", getMonthlySales);
router.get("/customers", getCustomerAnalytics);
router.get("/products", getProductAnalytics);
router.get("/marketing", getMarketingAnalytics);
router.get("/returns", getReturnsAnalytics);
router.get("/support", getSupportAnalytics);

module.exports = router;