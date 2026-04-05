const pool = require("../config/db");

/**
 * Get category_id from category name.
 */
const getCategoryId = async (categoryName) => {
  const [rows] = await pool.query(
    "SELECT id FROM categories WHERE name = ? LIMIT 1",
    [categoryName],
  );
  return rows[0]?.id ?? null;
};

/**
 * Get status_id from status name (lost | found | claimed | resolved).
 */
const getStatusId = async (statusName = "lost") => {
  const [rows] = await pool.query(
    "SELECT id FROM item_statuses WHERE name = ? LIMIT 1",
    [statusName],
  );
  return rows[0]?.id ?? 1;
};

/**
 * Generate the next reference number e.g. LF-2026-0043.
 */
const generateRefNumber = async () => {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM items WHERE YEAR(created_at) = ?",
    [year],
  );
  const next = (rows[0].total + 1).toString().padStart(4, "0");
  return `LF-${year}-${next}`;
};

/**
 * Full item SELECT — used after insert and for detail view.
 */
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
       i.time_reported,
       i.contact_email,
       i.created_at,
       u.first_name    AS reporter_first_name,
       u.last_name     AS reporter_last_name,
       u.email         AS reporter_email,
       u.avatar_initials,
       img.image_path  AS image
     FROM items i
     JOIN categories    c   ON c.id  = i.category_id
     JOIN item_statuses s   ON s.id  = i.status_id
     JOIN users         u   ON u.id  = i.reporter_id
     LEFT JOIN item_images img
       ON img.item_id = i.id AND img.is_primary = 1
     WHERE i.id = ?
     LIMIT 1`,
    [itemId],
  );
  return rows[0] ?? null;
};

/**
 * Insert item + image + status history + activity log in one transaction.
 * Returns the created item via findById.
 */
const createItem = async ({
  refNumber,
  name,
  description,
  categoryId,
  statusId,
  location,
  dateReported,
  reporterId,
  contactEmail,
  imagePath = null,
  ip = null,
  userAgent = null,
}) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO items
         (reference_number, name, description, category_id, status_id,
          location, date_reported, reporter_id, contact_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        refNumber,
        name,
        description,
        categoryId,
        statusId,
        location,
        dateReported,
        reporterId,
        contactEmail,
      ],
    );

    const itemId = result.insertId;

    if (imagePath) {
      await conn.query(
        "INSERT INTO item_images (item_id, image_path, is_primary) VALUES (?, ?, 1)",
        [itemId, imagePath],
      );
    }

    await conn.query(
      `INSERT INTO item_status_history
         (item_id, old_status_id, new_status_id, changed_by)
       VALUES (?, NULL, ?, ?)`,
      [itemId, statusId, reporterId],
    );

    await conn.query(
      `INSERT INTO user_activity_log
         (user_id, action, entity_type, entity_id, ip_address, user_agent)
       VALUES (?, 'submit_report', 'item', ?, ?, ?)`,
      [reporterId, itemId, ip, userAgent],
    );

    await conn.commit();
    return await findById(itemId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Browse items with optional filters, search, sort, pagination.
 */
const findAll = async ({
  status,
  category,
  search,
  sort = "newest",
  limit = 12,
  offset = 0,
}) => {
  let where = "WHERE i.is_active = 1";
  const params = [];

  if (status) {
    where += " AND s.name = ?";
    params.push(status);
  }
  if (category) {
    where += " AND c.name = ?";
    params.push(category);
  }
  if (search) {
    where +=
      " AND MATCH(i.name, i.description, i.location) AGAINST(? IN BOOLEAN MODE)";
    params.push(`${search}*`);
  }

  const orderMap = {
    newest: "i.created_at DESC",
    oldest: "i.created_at ASC",
    name_asc: "i.name ASC",
    name_desc: "i.name DESC",
  };
  const order = orderMap[sort] ?? "i.created_at DESC";

  const [items] = await pool.query(
    `SELECT
       i.id, i.reference_number, i.name,
       c.name AS category,
       s.name AS status, s.label AS status_label,
       i.location, i.date_reported, i.contact_email, i.created_at,
       u.first_name AS reporter_first_name,
       u.last_name  AS reporter_last_name,
       u.avatar_initials,
       img.image_path AS image
     FROM items i
     JOIN categories    c   ON c.id = i.category_id
     JOIN item_statuses s   ON s.id = i.status_id
     JOIN users         u   ON u.id = i.reporter_id
     LEFT JOIN item_images img ON img.item_id = i.id AND img.is_primary = 1
     ${where}
     ORDER BY ${order}
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countRes] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM items i
     JOIN categories    c ON c.id = i.category_id
     JOIN item_statuses s ON s.id = i.status_id
     ${where}`,
    params,
  );

  return { items, total: countRes[0].total };
};

/**
 * Get all items reported by a specific user.
 */
const findByReporter = async (reporterId) => {
  const [rows] = await pool.query(
    `SELECT
       i.id, i.reference_number, i.name,
       c.name AS category,
       s.name AS status, s.label AS status_label,
       i.location, i.date_reported, i.contact_email, i.created_at,
       img.image_path AS image
     FROM items i
     JOIN categories    c   ON c.id = i.category_id
     JOIN item_statuses s   ON s.id = i.status_id
     LEFT JOIN item_images img ON img.item_id = i.id AND img.is_primary = 1
     WHERE i.reporter_id = ? AND i.is_active = 1
     ORDER BY i.created_at DESC`,
    [reporterId],
  );
  return rows;
};

module.exports = {
  getCategoryId,
  getStatusId,
  generateRefNumber,
  findById,
  createItem,
  findAll,
  findByReporter,
};
