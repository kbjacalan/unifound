const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/users.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

// Any logged-in user can fetch their own profile
router.get("/me", getProfile);

module.exports = router;
