const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  logout,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");

// @route  POST /api/auth/signup
router.post("/signup", signup);

// @route  POST /api/auth/login
router.post("/login", login);

// @route  GET  /api/auth/me       ← requires token
router.get("/me", authenticate, getMe);

// @route  POST /api/auth/logout   ← requires token
router.post("/logout", authenticate, logout);

module.exports = router;
