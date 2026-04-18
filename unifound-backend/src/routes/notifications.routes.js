const express = require("express");
const router = express.Router();
const {
  getNotifications,
  markOneRead,
  markAllRead,
  deleteOne,
} = require("../controllers/notifications.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markOneRead);
router.delete("/:id", deleteOne);

module.exports = router;
