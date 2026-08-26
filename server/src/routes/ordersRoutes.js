const express = require("express");

const {
  getOrderKPIs,
  getOrders,
  getOrderById,
} = require("../controllers/ordersController");

const router = express.Router();

router.get("/kpis", getOrderKPIs);

router.get("/", getOrders);

router.get("/:id", getOrderById);

module.exports = router;