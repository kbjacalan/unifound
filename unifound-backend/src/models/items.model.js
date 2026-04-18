const pool = require("../config/db");

const getCategoryId = async (categoryName) => {
  const [rows] = await pool.query(
    "SELECT id FROM categories WHERE name = ? LIMIT 1",
    [categoryName],
  );
  return rows[0]?.id ?? null;
};

const getStatusId = async (statusName = "lost") => {
  const [rows] = await pool.query(
    "SELECT id FROM item_statuses WHERE name = ? LIMIT 1",
    [statusName],
  );
  return rows[0]?.id ?? 1;
};

const generateRefNumber = async () => {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM items WHERE YEAR(created_at) = ?",
    [year],
  );
  const next = (rows[0].total + 1).toString().padStart(4, "0");
  return `LF-${year}-${next}`;
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
       i.time_reported,
       i.contact_email,
       i.created_at,
       i.reporter_id,
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

    await conn.commit();
    return await findById(itemId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

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
       i.reporter_id,
       u.first_name AS reporter_first_name,
       u.last_name  AS reporter_last_name,
       u.email      AS reporter_email,
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

const findByReporter = async (reporterId) => {
  const [rows] = await pool.query(
    `SELECT
       i.id, i.reference_number, i.name,
       c.name AS category,
       s.name AS status, s.label AS status_label,
       i.location, i.date_reported, i.contact_email, i.description, i.created_at,
       i.reporter_id,
       u.first_name AS reporter_first_name,
       u.last_name  AS reporter_last_name,
       u.email      AS reporter_email,
       img.image_path AS image
     FROM items i
     JOIN categories    c   ON c.id = i.category_id
     JOIN item_statuses s   ON s.id = i.status_id
     JOIN users         u   ON u.id = i.reporter_id
     LEFT JOIN item_images img ON img.item_id = i.id AND img.is_primary = 1
     WHERE i.reporter_id = ? AND i.is_active = 1
     ORDER BY i.created_at DESC`,
    [reporterId],
  );
  return rows;
};

const updateItem = async (
  itemId,
  {
    name,
    description,
    categoryId,
    statusId,
    location,
    dateReported,
    contactEmail,
    imagePath,
    reporterId,
  },
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [current] = await conn.query(
      "SELECT status_id FROM items WHERE id = ? AND reporter_id = ? LIMIT 1",
      [itemId, reporterId],
    );
    if (!current.length) throw new Error("Item not found or not authorized.");
    const oldStatusId = current[0].status_id;

    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push("name = ?");
      values.push(name);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (categoryId !== undefined) {
      fields.push("category_id = ?");
      values.push(categoryId);
    }
    if (statusId !== undefined) {
      fields.push("status_id = ?");
      values.push(statusId);
    }
    if (location !== undefined) {
      fields.push("location = ?");
      values.push(location);
    }
    if (dateReported !== undefined) {
      fields.push("date_reported = ?");
      values.push(dateReported);
    }
    if (contactEmail !== undefined) {
      fields.push("contact_email = ?");
      values.push(contactEmail);
    }

    fields.push("updated_at = NOW()");
    values.push(itemId, reporterId);

    await conn.query(
      `UPDATE items SET ${fields.join(", ")} WHERE id = ? AND reporter_id = ?`,
      values,
    );

    if (imagePath !== undefined && imagePath !== null) {
      const [existing] = await conn.query(
        "SELECT id, image_path FROM item_images WHERE item_id = ? AND is_primary = 1 LIMIT 1",
        [itemId],
      );
      if (existing.length) {
        const oldPath = require("path").join(
          process.cwd(),
          existing[0].image_path,
        );
        if (require("fs").existsSync(oldPath))
          require("fs").unlinkSync(oldPath);
        await conn.query(
          "UPDATE item_images SET image_path = ?, uploaded_at = NOW() WHERE id = ?",
          [imagePath, existing[0].id],
        );
      } else {
        await conn.query(
          "INSERT INTO item_images (item_id, image_path, is_primary) VALUES (?, ?, 1)",
          [itemId, imagePath],
        );
      }
    }

    if (statusId !== undefined && statusId !== oldStatusId) {
      await conn.query(
        `INSERT INTO item_status_history (item_id, old_status_id, new_status_id, changed_by)
         VALUES (?, ?, ?, ?)`,
        [itemId, oldStatusId, statusId, reporterId],
      );
    }

    await conn.commit();
    return await findById(itemId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const softDelete = async (itemId, reporterId) => {
  const [result] = await pool.query(
    "UPDATE items SET is_active = 0, updated_at = NOW() WHERE id = ? AND reporter_id = ?",
    [itemId, reporterId],
  );
  if (result.affectedRows === 0)
    throw new Error("Item not found or not authorized.");
};

module.exports = {
  getCategoryId,
  getStatusId,
  generateRefNumber,
  findById,
  createItem,
  findAll,
  findByReporter,
  updateItem,
  softDelete,
};
