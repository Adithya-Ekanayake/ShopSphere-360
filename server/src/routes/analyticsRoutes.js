const express = require("express");
const { filterValidation } = require("../middleware/validation");

const {
  getKPIs,
  getMonthlySales,
  getTopProducts,
  getCustomerAnalytics,
  getMarketingAnalytics,
  getReturnsAnalytics,
  getSupportAnalytics,
  getFilterOptions,
  getCustomerRfm,
  getCustomerClv,
  getCustomerRetention,
  getProductProfitability,
  getCustomerCohorts,
} = require("../controllers/analyticsController");

const router = express.Router();
router.use(filterValidation);

// ==========================================
// FILTER OPTIONS
// ==========================================

router.get("/filter-options", getFilterOptions);
router.get("/rfm", getCustomerRfm);
router.get("/clv", getCustomerClv);
router.get("/retention", getCustomerRetention);
router.get("/product-profitability", getProductProfitability);
router.get("/cohorts", getCustomerCohorts);

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