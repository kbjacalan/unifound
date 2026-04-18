const pool = require("../config/db");

const findById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.first_name,
       u.last_name,
       u.email,
       u.avatar_initials,
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

module.exports = {
  findById,
  updateRole,
};
