const express = require("express");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  syncRecommendations,
  getRecommendations,
  updateRecommendationStatus,
} = require("../controllers/recommendationsController");
const { recommendationListValidation, recommendationUpdateValidation, filterValidation } = require("../middleware/validation");

const router = express.Router();

router.get("/", requireAuth, recommendationListValidation, getRecommendations);
router.post("/sync", requireAuth, requireRole("Admin", "Manager"), filterValidation, syncRecommendations);
router.patch("/:recommendationKey", requireAuth, requireRole("Admin", "Manager"), recommendationUpdateValidation, updateRecommendationStatus);

module.exports = router;
