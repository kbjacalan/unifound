const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthModel = require("../models/auth.model");
const { success, error } = require("../utils/apiResponse");

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup
// ─────────────────────────────────────────────────────────────────────────────
const signup = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role = "Student",
    } = req.body;

    if (!first_name || !last_name || !email || !password)
      return error(res, "All fields are required.", 400);
    if (password.length < 6)
      return error(res, "Password must be at least 6 characters.", 400);
    if (!["Student", "Staff"].includes(role))
      return error(res, "Invalid role. Must be Student or Staff.", 400);

    if (await AuthModel.emailExists(email))
      return error(res, "Email is already registered.", 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await AuthModel.createUser(
      first_name,
      last_name,
      email,
      passwordHash,
      role,
    );
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return success(res, { token, user }, "Account created successfully.", 201);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return error(res, "Email and password are required.", 400);

    const userRecord = await AuthModel.findByEmail(email);
    if (!userRecord) return error(res, "Invalid email or password.", 401);

    const isMatch = await bcrypt.compare(password, userRecord.password_hash);
    if (!isMatch) return error(res, "Invalid email or password.", 401);

    await AuthModel.updateLastLogin(userRecord.id);
    await AuthModel.logActivity(
      userRecord.id,
      "login",
      req.ip,
      req.headers["user-agent"],
    );

    // Re-fetch without password_hash
    const user = await AuthModel.findById(userRecord.id);
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return success(res, { token, user }, "Login successful.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await AuthModel.findById(req.user.id);
    if (!user) return error(res, "User not found.", 404);
    return success(res, { user }, "User fetched successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    await AuthModel.logActivity(
      req.user.id,
      "logout",
      req.ip,
      req.headers["user-agent"],
    );
    return success(res, {}, "Logged out successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe, logout };
