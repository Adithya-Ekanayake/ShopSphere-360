const express = require("express");
const { login, getMe } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { loginValidation } = require("../middleware/validation");

const router = express.Router();

// Public
router.post("/login", loginValidation, login);

// Protected — returns current user profile
router.get("/me", requireAuth, getMe);

module.exports = router;
