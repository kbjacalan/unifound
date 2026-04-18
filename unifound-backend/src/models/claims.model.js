const pool = require("../config/db");
const NotificationsModel = require("./notifications.model");

/**
 * Submit a new claim. Returns the created claim row.
 */
const createClaim = async ({ itemId, claimantId, message }) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Fetch item + reporter info in one query
    const [items] = await conn.query(
      `SELECT i.id, i.name, i.reporter_id, s.name AS status
       FROM items i
       JOIN item_statuses s ON s.id = i.status_id
       WHERE i.id = ? AND i.is_active = 1
       LIMIT 1`,
      [itemId],
    );

    if (!items.length) throw new Error("Item not found.");
    const item = items[0];

    if (item.reporter_id === claimantId)
      throw new Error("You cannot claim your own report.");

    if (item.status !== "lost" && item.status !== "found")
      throw new Error("This item is no longer accepting claims.");

    // Prevent duplicate pending claim from same user
    const [existing] = await conn.query(
      "SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status = 'pending' LIMIT 1",
      [itemId, claimantId],
    );
    if (existing.length)
      throw new Error("You already have a pending claim on this item.");

    const [result] = await conn.query(
      "INSERT INTO claims (item_id, claimant_id, message) VALUES (?, ?, ?)",
      [itemId, claimantId, message || null],
    );
    const claimId = result.insertId;

    // Fetch claimant name for notification body
    const [claimants] = await conn.query(
      "SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1",
      [claimantId],
    );
    const claimantName = claimants.length
      ? `${claimants[0].first_name} ${claimants[0].last_name}`
      : "A user";

    // Log activity
    await conn.query(
      `INSERT INTO user_activity_log (user_id, action, entity_type, entity_id)
       VALUES (?, 'claim_item', 'claim', ?)`,
      [claimantId, claimId],
    );

    await conn.commit();

    // Notify the reporter (finder) — outside the transaction is fine
    await NotificationsModel.createNotification({
      userId: item.reporter_id,
      type: "message",
      title: `Someone claims "${item.name}"`,
      body: `${claimantName} has submitted a claim and has been given your contact info. Approve once the item is physically returned.`,
      itemId,
    });

    return claimId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Get all pending claims on items reported by `reporterId`.
 */
const findIncomingClaims = async (reporterId) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.item_id,
       c.message,
       c.status,
       c.created_at,
       i.name          AS item_name,
       i.reference_number,
       u.first_name    AS claimant_first_name,
       u.last_name     AS claimant_last_name,
       u.email         AS claimant_email,
       u.avatar_initials
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN users u ON u.id = c.claimant_id
     WHERE i.reporter_id = ? AND c.status = 'pending'
     ORDER BY c.created_at DESC`,
    [reporterId],
  );
  return rows;
};

/**
 * Get a specific item's claims (all statuses) for the reporter.
 */
const findClaimsByItem = async (itemId, reporterId) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.item_id,
       c.message,
       c.status,
       c.created_at,
       u.first_name    AS claimant_first_name,
       u.last_name     AS claimant_last_name,
       u.email         AS claimant_email,
       u.avatar_initials
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN users u ON u.id = c.claimant_id
     WHERE c.item_id = ? AND i.reporter_id = ?
     ORDER BY c.created_at DESC`,
    [itemId, reporterId],
  );
  return rows;
};

/**
 * Get claims made BY the logged-in user (their claim history).
 */
const findMyClaims = async (claimantId) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.item_id,
       c.message,
       c.status,
       c.created_at,
       c.reviewed_at,
       i.name          AS item_name,
       i.reference_number,
       s.label         AS item_status_label,
       u.first_name    AS reporter_first_name,
       u.last_name     AS reporter_last_name
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN item_statuses s ON s.id = i.status_id
     JOIN users u ON u.id = i.reporter_id
     WHERE c.claimant_id = ?
     ORDER BY c.created_at DESC`,
    [claimantId],
  );
  return rows;
};

/**
 * Approve a claim. Updates claim, item status → claimed, notifies claimant.
 */
const approveClaim = async (claimId, reporterId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Verify the claim belongs to an item owned by reporter
    const [claims] = await conn.query(
      `SELECT c.id, c.claimant_id, c.item_id, i.name AS item_name, i.status_id
       FROM claims c
       JOIN items i ON i.id = c.item_id
       WHERE c.id = ? AND i.reporter_id = ? AND c.status = 'pending'
       LIMIT 1`,
      [claimId, reporterId],
    );
    if (!claims.length)
      throw new Error("Claim not found or you are not authorized.");

    const claim = claims[0];

    // Get 'claimed' status id
    const [statuses] = await conn.query(
      "SELECT id FROM item_statuses WHERE name = 'claimed' LIMIT 1",
    );
    const claimedStatusId = statuses[0].id;

    // Update claim status
    await conn.query(
      "UPDATE claims SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [reporterId, claimId],
    );

    // Reject all other pending claims on same item
    await conn.query(
      `UPDATE claims SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW()
       WHERE item_id = ? AND id != ? AND status = 'pending'`,
      [reporterId, claim.item_id, claimId],
    );

    // Update item status to claimed
    const oldStatusId = claim.status_id;
    await conn.query(
      "UPDATE items SET status_id = ?, updated_at = NOW() WHERE id = ?",
      [claimedStatusId, claim.item_id],
    );

    // Log status history
    await conn.query(
      `INSERT INTO item_status_history (item_id, old_status_id, new_status_id, changed_by)
       VALUES (?, ?, ?, ?)`,
      [claim.item_id, oldStatusId, claimedStatusId, reporterId],
    );

    await conn.commit();

    // Notify claimant of approval
    await NotificationsModel.createNotification({
      userId: claim.claimant_id,
      type: "claimed",
      title: `Your claim was approved! 🎉`,
      body: `The reporter has confirmed the handoff for "${claim.item_name}". This case is now closed.`,
      itemId: claim.item_id,
    });

    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Reject a claim. Notifies claimant.
 */
const rejectClaim = async (claimId, reporterId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [claims] = await conn.query(
      `SELECT c.id, c.claimant_id, c.item_id, i.name AS item_name
       FROM claims c
       JOIN items i ON i.id = c.item_id
       WHERE c.id = ? AND i.reporter_id = ? AND c.status = 'pending'
       LIMIT 1`,
      [claimId, reporterId],
    );
    if (!claims.length)
      throw new Error("Claim not found or you are not authorized.");

    const claim = claims[0];

    await conn.query(
      "UPDATE claims SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [reporterId, claimId],
    );

    await conn.commit();

    // Notify claimant of rejection
    await NotificationsModel.createNotification({
      userId: claim.claimant_id,
      type: "alert",
      title: `Your claim was not approved`,
      body: `Your claim for "${claim.item_name}" was reviewed and rejected by the reporter.`,
      itemId: claim.item_id,
    });

    return true;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Check if a user has an existing pending claim on a specific item.
 */
const findExistingClaim = async (itemId, claimantId) => {
  const [rows] = await pool.query(
    "SELECT id, status FROM claims WHERE item_id = ? AND claimant_id = ? ORDER BY created_at DESC LIMIT 1",
    [itemId, claimantId],
  );
  return rows[0] ?? null;
};

module.exports = {
  createClaim,
  findIncomingClaims,
  findClaimsByItem,
  findMyClaims,
  approveClaim,
  rejectClaim,
  findExistingClaim,
};
