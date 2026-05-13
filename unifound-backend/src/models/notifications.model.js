const supabase = require("../config/db");
const { notifyUser } = require("../socket");

const createNotification = async ({
  userId,
  type,
  title,
  body,
  itemId = null,
}) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      user_id: userId,
      type,
      title,
      body,
      item_id: itemId,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Push real-time event to the user's socket room
  notifyUser(userId, {
    id: data.id,
    type,
    title,
    body,
    item_id: itemId,
    is_read: false,
    created_at: new Date().toISOString(),
  });

  return data.id;
};

const findByUser = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, item_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);
  return data ?? [];
};

const markRead = async (notifId, userId) => {
  const { error, count } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notifId)
    .eq("user_id", userId)
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Notification not found.");
};

const markAllRead = async (userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
};

const deleteNotification = async (notifId, userId) => {
  const { error, count } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notifId)
    .eq("user_id", userId)
    .select("id", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  if (count === 0) throw new Error("Notification not found.");
};

const countUnread = async (userId) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return count ?? 0;
};

module.exports = {
  createNotification,
  findByUser,
  markRead,
  markAllRead,
  deleteNotification,
  countUnread,
};
