const pool = require("../config/db");

const findById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.first_name,
       u.last_name,
       u.email,
       u.avatar_initials,
       u.is_verified,
       u.is_active,
       u.last_login_at,
       u.created_at,
       r.name               AS role,
       COUNT(DISTINCT i.id) AS report_count
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles      r  ON r.id = ur.role_id
     LEFT JOIN items      i  ON i.reporter_id = u.id AND i.is_active = 1
     WHERE u.id = ?
     GROUP BY u.id, r.name
     LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
};

const findAll = async ({ search, role, limit = 20, offset = 0 }) => {
  let where = "WHERE u.is_active = 1";
  const params = [];

  if (role && role !== "All") {
    where += " AND r.name = ?";
    params.push(role);
  }

  if (search) {
    where +=
      " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  const [users] = await pool.query(
    `SELECT
       u.id, u.first_name, u.last_name, u.email,
       u.avatar_initials, u.is_verified, u.is_active,
       u.last_login_at, u.created_at,
       r.name               AS role,
       COUNT(DISTINCT i.id) AS report_count
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles      r  ON r.id = ur.role_id
     LEFT JOIN items      i  ON i.reporter_id = u.id AND i.is_active = 1
     ${where}
     GROUP BY u.id, r.name
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset],
  );

  const [countRes] = await pool.query(
    `SELECT COUNT(DISTINCT u.id) AS total
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles      r  ON r.id = ur.role_id
     ${where}`,
    params,
  );

  return { users, total: countRes[0].total };
};

const softDelete = async (userId) => {
  await pool.query(
    "UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?",
    [userId],
  );
};

const toggleVerified = async (userId, currentStatus) => {
  const newStatus = currentStatus ? 0 : 1;
  await pool.query(
    "UPDATE users SET is_verified = ?, updated_at = NOW() WHERE id = ?",
    [newStatus, userId],
  );
  return Boolean(newStatus);
};

const updateRole = async (userId, roleName) => {
  const [roleRows] = await pool.query(
    "SELECT id FROM roles WHERE name = ? LIMIT 1",
    [roleName],
  );
  if (!roleRows.length) throw new Error(`Role "${roleName}" not found`);

  await pool.query("UPDATE user_roles SET role_id = ? WHERE user_id = ?", [
    roleRows[0].id,
    userId,
  ]);
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
     VALUES (?, ?, 'user', ?, ?, ?, ?)`,
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
  findById,
  findAll,
  softDelete,
  toggleVerified,
  updateRole,
  logAdminAction,
};
