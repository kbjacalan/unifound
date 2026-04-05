const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  getMyReports,
  getItemDetail,
} = require("../controllers/items.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

// All item routes require a valid JWT
router.use(authenticate);

// GET  /api/items              → browse all items (with filters)
router.get("/", getItems);

// GET  /api/items/my-reports   → current user's reports only
router.get("/my-reports", getMyReports);

// GET  /api/items/:id          → single item detail
router.get("/:id", getItemDetail);

// POST /api/items              → submit a new report (with optional image)
router.post(
  "/",
  upload.single("image"), // matches the field name in ReportItemForm
  createItem,
);

module.exports = router;
