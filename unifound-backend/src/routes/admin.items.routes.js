const express = require("express");
const router = express.Router();

const {
  getAllItems,
  getItemById,
  updateItemStatus,
  deleteItem,
  deleteItemsBulk,
} = require("../controllers/admin.items.controller");

const { authenticate, authorize } = require("../middlewares/auth.middleware");

router.use(authenticate);
router.use(authorize("Administrator"));

router.get("/", getAllItems);

router.get("/:id", getItemById);

router.patch("/:id/status", updateItemStatus);

router.delete("/bulk", deleteItemsBulk);

router.delete("/:id", deleteItem);

module.exports = router;
