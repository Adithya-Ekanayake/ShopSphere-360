const express = require("express");

const {
  getCustomers,
  getCustomerByKey,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const router = express.Router();

router.get("/", getCustomers);

router.get("/:customerKey", getCustomerByKey);

router.post("/", createCustomer);

router.put("/:customerKey", updateCustomer);

router.delete("/:customerKey", deleteCustomer);

module.exports = router;