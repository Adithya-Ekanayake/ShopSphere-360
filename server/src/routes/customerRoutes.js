const express = require("express");

const {
  getCustomers,
  getCustomerByKey,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const {
  requireAuth,
  requireRole,
} = require("../middleware/authMiddleware");
const { customerValidation, positiveParam, filterValidation } = require("../middleware/validation");

const router = express.Router();

// Read — any authenticated user
router.get("/", requireAuth, filterValidation, getCustomers);
router.get("/:customerKey", requireAuth, positiveParam("customerKey"), getCustomerByKey);

// Write — Admin or Manager only
router.post("/", requireAuth, requireRole("Admin", "Manager"), customerValidation(), createCustomer);
router.put("/:customerKey", requireAuth, requireRole("Admin", "Manager"), positiveParam("customerKey"), customerValidation(true), updateCustomer);
router.delete("/:customerKey", requireAuth, requireRole("Admin", "Manager"), positiveParam("customerKey"), deleteCustomer);

module.exports = router;