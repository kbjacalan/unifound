const ClaimsModel = require("../models/claims.model");
const { success, error } = require("../utils/apiResponse");

/**
 * POST /api/claims
 * Claimant submits a new claim.
 */
const submitClaim = async (req, res, next) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId) return error(res, "itemId is required.", 400);

    const claimId = await ClaimsModel.createClaim({
      itemId: parseInt(itemId),
      claimantId: req.user.id,
      message: message?.trim() || null,
    });

    return success(res, { claimId }, "Claim submitted successfully.", 201);
  } catch (err) {
    const clientErrors = [
      "Item not found.",
      "You cannot claim your own report.",
      "This item is no longer accepting claims.",
      "You already have a pending claim on this item.",
    ];
    if (clientErrors.includes(err.message)) return error(res, err.message, 400);
    next(err);
  }
};

/**
 * GET /api/claims/incoming
 * Reporter sees pending claims on their own items.
 */
const getIncomingClaims = async (req, res, next) => {
  try {
    const claims = await ClaimsModel.findIncomingClaims(req.user.id);
    return success(res, { claims });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/item/:itemId
 * Reporter gets all claims (all statuses) for a specific item.
 */
const getItemClaims = async (req, res, next) => {
  try {
    const claims = await ClaimsModel.findClaimsByItem(
      parseInt(req.params.itemId),
      req.user.id,
    );
    return success(res, { claims });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/mine
 * Claimant sees their own claim history.
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await ClaimsModel.findMyClaims(req.user.id);
    return success(res, { claims });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/claims/check/:itemId
 * Check if current user already has a claim on this item.
 */
const checkExistingClaim = async (req, res, next) => {
  try {
    const claim = await ClaimsModel.findExistingClaim(
      parseInt(req.params.itemId),
      req.user.id,
    );
    return success(res, { claim });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/claims/:id/approve
 * Reporter approves a claim.
 */
const approveClaim = async (req, res, next) => {
  try {
    await ClaimsModel.approveClaim(parseInt(req.params.id), req.user.id);
    return success(res, {}, "Claim approved. Item status updated to Claimed.");
  } catch (err) {
    if (err.message === "Claim not found or you are not authorized.")
      return error(res, err.message, 403);
    next(err);
  }
};

/**
 * PATCH /api/claims/:id/reject
 * Reporter rejects a claim.
 */
const rejectClaim = async (req, res, next) => {
  try {
    await ClaimsModel.rejectClaim(parseInt(req.params.id), req.user.id);
    return success(res, {}, "Claim rejected.");
  } catch (err) {
    if (err.message === "Claim not found or you are not authorized.")
      return error(res, err.message, 403);
    next(err);
  }
};

module.exports = {
  submitClaim,
  getIncomingClaims,
  getItemClaims,
  getMyClaims,
  checkExistingClaim,
  approveClaim,
  rejectClaim,
};
