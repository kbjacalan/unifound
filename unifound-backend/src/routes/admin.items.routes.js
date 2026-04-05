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

// All routes require a valid JWT + Administrator role
router.use(authenticate);
router.use(authorize("Administrator"));

// GET    /api/admin/items           → all items with search + filter + pagination
router.get("/", getAllItems);

// GET    /api/admin/items/:id       → single item detail
router.get("/:id", getItemById);

// PATCH  /api/admin/items/:id/status → update status
router.patch("/:id/status", updateItemStatus);

// DELETE /api/admin/items/bulk      → bulk soft-delete  ← must be BEFORE /:id
router.delete("/bulk", deleteItemsBulk);

// DELETE /api/admin/items/:id       → single soft-delete
router.delete("/:id", deleteItem);

module.exports = router;
