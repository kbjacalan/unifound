const pool = require("../config/db");

/**
 * Find a user by email including password_hash.
 * Used for login verification.
 */
const findByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT
       u.id,
       u.first_name,
       u.last_name,
       u.email,
       u.password_hash,
       u.avatar_initials,
       u.is_verified,
       u.is_active,
       r.name AS role
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles      r  ON r.id = ur.role_id
     WHERE u.email = ? AND u.is_active = 1
     LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
};

/**
 * Find a user by ID — safe, no password_hash.
 */
const findById = async (id) => {
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
       r.name AS role
     FROM users u
     LEFT JOIN user_roles ur ON ur.user_id = u.id
     LEFT JOIN roles      r  ON r.id = ur.role_id
     WHERE u.id = ? AND u.is_active = 1
     LIMIT 1`,
    [id],
  );
  return rows[0] ?? null;
};

/**
 * Check if an email is already registered.
 */
const emailExists = async (email) => {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  return rows.length > 0;
};

/**
 * Insert a new user and assign their role.
 * Runs inside a transaction.
 * Returns the newly created user (via findById).
 */
const createUser = async (
  firstName,
  lastName,
  email,
  passwordHash,
  roleName,
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

    const [result] = await conn.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, avatar_initials)
       VALUES (?, ?, ?, ?, ?)`,
      [firstName, lastName, email, passwordHash, initials],
    );

    const userId = result.insertId;

    const [roleRows] = await conn.query(
      "SELECT id FROM roles WHERE name = ? LIMIT 1",
      [roleName],
    );
    const roleId = roleRows[0]?.id ?? 1; // fallback to Student

    await conn.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [userId, roleId],
    );

    await conn.commit();
    return await findById(userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/**
 * Update last_login_at timestamp.
 */
const updateLastLogin = async (userId) => {
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [
    userId,
  ]);
};

/**
 * Log a user action (login, logout, etc.).
 */
const logActivity = async (userId, action, ip = null, userAgent = null) => {
  await pool.query(
    `INSERT INTO user_activity_log (user_id, action, ip_address, user_agent)
     VALUES (?, ?, ?, ?)`,
    [userId, action, ip, userAgent],
  );
};

module.exports = {
  findByEmail,
  findById,
  emailExists,
  createUser,
  updateLastLogin,
  logActivity,
};
