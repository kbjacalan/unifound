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

router.use(authenticate);

router.get("/", getItems);

router.get("/my-reports", getMyReports);

router.get("/:id", getItemDetail);

router.post("/", upload.single("image"), createItem);

module.exports = router;
