const pool = require("../config/db");

const createNotification = async ({
  userId,
  type,
  title,
  body,
  itemId = null,
}) => {
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, item_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, type, title, body, itemId],
  );
  return result.insertId;
};

const findByUser = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, type, title, body, is_read, item_id,
            created_at
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 100`,
    [userId],
  );
  return rows;
};

const markRead = async (notifId, userId) => {
  const [result] = await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
    [notifId, userId],
  );
  if (result.affectedRows === 0) throw new Error("Notification not found.");
};

const markAllRead = async (userId) => {
  await pool.query(
    "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
    [userId],
  );
};

const deleteNotification = async (notifId, userId) => {
  const [result] = await pool.query(
    "DELETE FROM notifications WHERE id = ? AND user_id = ?",
    [notifId, userId],
  );
  if (result.affectedRows === 0) throw new Error("Notification not found.");
};

const countUnread = async (userId) => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0",
    [userId],
  );
  return rows[0].total;
};

module.exports = {
  createNotification,
  findByUser,
  markRead,
  markAllRead,
  deleteNotification,
  countUnread,
};
