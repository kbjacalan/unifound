const pool = require("../config/db");

const findAll = async ({ search, status, limit = 20, offset = 0 }) => {
  let where = "WHERE i.is_active = 1";
  const params = [];

  if (status && status !== "All") {
    where += " AND s.name = ?";
    params.push(status.toLowerCase());
  }

  if (search) {
    where += ` AND (
      i.name            LIKE ? OR
      i.reference_number LIKE ? OR
      i.location        LIKE ? OR
      CONCAT(u.first_name, ' ', u.last_name) LIKE ?
    )`;
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const [items] = await pool.query(
    `SELECT
       i.id,
       i.reference_number,
       i.name,
       c.name          AS category,
       s.name          AS status,
       s.label         AS status_label,
       i.location,
       i.date_reported,
       i.created_at,
       CONCAT(u.first_name, ' ', u.last_name) AS reporter_name,
       u.email         AS reporter_email,
       img.image_path  AS image
     FROM items i
     JOIN categories    c   ON c.id = i.category_id
     JOIN item_statuses s   ON s.id = i.status_id
     JOIN users         u   ON u.id = i.reporter_id
     LEFT JOIN item_images img ON img.item_id = i.id AND img.is_primary = 1
     ${where}
     ORDER BY i.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countRes] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM items i
     JOIN categories    c ON c.id = i.category_id
     JOIN item_statuses s ON s.id = i.status_id
     JOIN users         u ON u.id = i.reporter_id
     ${where}`,
    params,
  );

  return { items, total: countRes[0].total };
};

const findById = async (itemId) => {
  const [rows] = await pool.query(
    `SELECT
       i.id,
       i.reference_number,
       i.name,
       i.description,
       c.name          AS category,
       s.name          AS status,
       s.label         AS status_label,
       i.location,
       i.date_reported,
       i.contact_email,
       i.created_at,
       CONCAT(u.first_name, ' ', u.last_name) AS reporter_name,
       u.email         AS reporter_email,
       img.image_path  AS image
     FROM items i
     JOIN categories    c   ON c.id = i.category_id
     JOIN item_statuses s   ON s.id = i.status_id
     JOIN users         u   ON u.id = i.reporter_id
     LEFT JOIN item_images img ON img.item_id = i.id AND img.is_primary = 1
     WHERE i.id = ?
     LIMIT 1`,
    [itemId],
  );
  return rows[0] ?? null;
};

const getStatusId = async (statusName) => {
  const [rows] = await pool.query(
    "SELECT id FROM item_statuses WHERE name = ? LIMIT 1",
    [statusName],
  );
  return rows[0]?.id ?? null;
};

const updateStatus = async (itemId, newStatusName, adminId) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Get current status_id
    const [current] = await conn.query(
      "SELECT status_id FROM items WHERE id = ? LIMIT 1",
      [itemId],
    );
    const oldStatusId = current[0]?.status_id ?? null;

    // Get new status_id
    const [statusRows] = await conn.query(
      "SELECT id FROM item_statuses WHERE name = ? LIMIT 1",
      [newStatusName],
    );
    const newStatusId = statusRows[0]?.id;
    if (!newStatusId) throw new Error(`Status "${newStatusName}" not found`);

    // Update item
    await conn.query(
      "UPDATE items SET status_id = ?, updated_at = NOW() WHERE id = ?",
      [newStatusId, itemId],
    );

    // Log status change
    await conn.query(
      `INSERT INTO item_status_history
         (item_id, old_status_id, new_status_id, changed_by)
       VALUES (?, ?, ?, ?)`,
      [itemId, oldStatusId, newStatusId, adminId],
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const softDelete = async (itemId) => {
  await pool.query(
    "UPDATE items SET is_active = 0, updated_at = NOW() WHERE id = ?",
    [itemId],
  );
};

const softDeleteBulk = async (itemIds) => {
  if (!itemIds.length) return;
  const placeholders = itemIds.map(() => "?").join(", ");
  await pool.query(
    `UPDATE items SET is_active = 0, updated_at = NOW() WHERE id IN (${placeholders})`,
    itemIds,
  );
};

const logAdminAction = async ({
  adminId,
  action,
  entityId,
  oldValue = null,
  newValue = null,
  ip = null,
}) => {
  await pool.query(
    `INSERT INTO activity_logs
       (admin_id, action, entity_type, entity_id, old_value, new_value, ip_address)
     VALUES (?, ?, 'item', ?, ?, ?, ?)`,
    [
      adminId,
      action,
      entityId,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      ip,
    ],
  );
};

module.exports = {
  findAll,
  findById,
  getStatusId,
  updateStatus,
  softDelete,
  softDeleteBulk,
  logAdminAction,
};
