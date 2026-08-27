const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { getInsights } = require("../controllers/insightsController");
const { filterValidation } = require("../middleware/validation");

const router = express.Router();
router.get("/", requireAuth, filterValidation, getInsights);

module.exports = router;
