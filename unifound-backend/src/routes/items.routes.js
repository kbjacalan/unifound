const express = require("express");
const router = express.Router();
const {
  createItem,
  getItems,
  getMyReports,
  getItemDetail,
  updateItem,
  deleteItem,
} = require("../controllers/items.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { upload } = require("../middlewares/upload.middleware");

router.use(authenticate);

router.get("/", getItems);

router.get("/my-reports", getMyReports);

router.get("/:id", getItemDetail);

router.post("/", upload.single("image"), createItem);

router.put("/:id", upload.single("image"), updateItem);

router.delete("/:id", deleteItem);

module.exports = router;
