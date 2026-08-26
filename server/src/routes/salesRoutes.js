const express = require("express");

const {
  getSalesKPIs,
  getMonthlySales,
  getSalesByChannel,
  getRecentOrders,
} = require("../controllers/salesController");

const router = express.Router();

router.get("/kpis", getSalesKPIs);
router.get("/monthly", getMonthlySales);
router.get("/channels", getSalesByChannel);
router.get("/recent-orders", getRecentOrders);

module.exports = router;