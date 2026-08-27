const express = require("express");
const { filterValidation } = require("../middleware/validation");

const {
  getTransactionKPIs,
  getTransactions,
  getTransactionsByMethod,
} = require("../controllers/transactionsController");

const router = express.Router();
router.use(filterValidation);

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