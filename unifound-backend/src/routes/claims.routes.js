const express = require("express");
const router = express.Router();
const {
  submitClaim,
  getIncomingClaims,
  getItemClaims,
  getMyClaims,
  checkExistingClaim,
  approveClaim,
  rejectClaim,
} = require("../controllers/claims.controller");
const { authenticate } = require("../middlewares/auth.middleware");

router.use(authenticate);

// Claimant routes
router.post("/", submitClaim);
router.get("/mine", getMyClaims);
router.get("/check/:itemId", checkExistingClaim);

// Reporter routes
router.get("/incoming", getIncomingClaims);
router.get("/item/:itemId", getItemClaims);
router.patch("/:id/approve", approveClaim);
router.patch("/:id/reject", rejectClaim);

module.exports = router;
