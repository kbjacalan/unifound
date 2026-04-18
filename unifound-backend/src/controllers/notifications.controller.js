const NotificationsModel = require("../models/notifications.model");
const { success, error } = require("../utils/apiResponse");

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await NotificationsModel.findByUser(req.user.id);
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return success(res, { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

const markOneRead = async (req, res, next) => {
  try {
    await NotificationsModel.markRead(
      parseInt(req.params.id),
      req.user.id,
    );
    return success(res, {}, "Notification marked as read.");
  } catch (err) {
    if (err.message === "Notification not found.")
      return error(res, err.message, 404);
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await NotificationsModel.markAllRead(req.user.id);
    return success(res, {}, "All notifications marked as read.");
  } catch (err) {
    next(err);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    await NotificationsModel.deleteNotification(
      parseInt(req.params.id),
      req.user.id,
    );
    return success(res, {}, "Notification deleted.");
  } catch (err) {
    if (err.message === "Notification not found.")
      return error(res, err.message, 404);
    next(err);
  }
};

module.exports = { getNotifications, markOneRead, markAllRead, deleteOne };
