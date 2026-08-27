const express = require("express");
const { filterValidation, positiveParam } = require("../middleware/validation");

const {
  getOrderKPIs,
  getOrders,
  getOrderById,
} = require("../controllers/ordersController");

const router = express.Router();

router.get("/kpis", getOrderKPIs);

router.get("/", filterValidation, getOrders);

router.get("/:id", positiveParam("id"), getOrderById);

module.exports = router;