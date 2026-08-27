const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { exportCSV, exportExcel, exportPDF } = require("../controllers/exportController");
const { exportValidation } = require("../middleware/validation");

const router = express.Router();
router.get("/csv", requireAuth, exportValidation, exportCSV);
router.get("/excel", requireAuth, exportValidation, exportExcel);
router.get("/pdf", requireAuth, exportValidation, exportPDF);

module.exports = router;