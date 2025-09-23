const express = require("express");
const router = express.Router();
const { register, login, getDashboard } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// -------------------------
// Public Routes
// -------------------------
router.post("/signup", register);      // User registration
router.post("/login", login);          // User login

// -------------------------
// Protected Routes
// -------------------------
router.get("/dashboard", authMiddleware, getDashboard);  // User dashboard (JWT protected)

module.exports = router;
