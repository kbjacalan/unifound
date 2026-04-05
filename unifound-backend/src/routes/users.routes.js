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

router.use(authenticate);
router.use(authorize("Administrator"));

router.get("/", getAllUsers);

router.get("/:id", getUserById);

router.delete("/:id", deleteUser);

router.patch("/:id/verify", verifyUser);

router.patch("/:id/role", changeUserRole);

module.exports = router;
