const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  deleteUser,
  verifyUser,
  changeUserRole,
} = require("../controllers/users.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");

// All user management routes require a valid JWT + Administrator role
router.use(authenticate);
router.use(authorize("Administrator"));

// GET    /api/users           → list all users (with search + filter)
router.get("/", getAllUsers);

// GET    /api/users/:id       → single user detail
router.get("/:id", getUserById);

// DELETE /api/users/:id       → soft-delete a user
router.delete("/:id", deleteUser);

// PATCH  /api/users/:id/verify → toggle is_verified
router.patch("/:id/verify", verifyUser);

// PATCH  /api/users/:id/role   → change role
router.patch("/:id/role", changeUserRole);

module.exports = router;
