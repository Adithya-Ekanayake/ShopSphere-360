const express = require("express");

const {
  getRevenueForecast,
  getProductDemandForecast,
  getForecastMetadata,
} = require("../controllers/predictionController");

const { requireAuth } = require("../middleware/authMiddleware");
const { predictionValidation } = require("../middleware/validation");

const router = express.Router();

// All prediction routes require authentication (any role can view)
router.use(requireAuth);

// GET /api/predictions/revenue
// Returns historical actuals + forecasted revenue
router.get("/revenue", getRevenueForecast);

// GET /api/predictions/product-demand
// Returns per-product demand forecasts
router.get("/product-demand", predictionValidation, getProductDemandForecast);

// GET /api/predictions/metadata
// Returns metadata about when forecasts were generated
router.get("/metadata", getForecastMetadata);

module.exports = router;