const express = require("express");

const {
  getTransactionKPIs,
  getTransactions,
  getTransactionsByMethod,
} = require("../controllers/transactionsController");

const router = express.Router();

router.get(
  "/kpis",
  getTransactionKPIs
);

router.get(
  "/",
  getTransactions
);

router.get(
  "/methods",
  getTransactionsByMethod
);

module.exports = router;