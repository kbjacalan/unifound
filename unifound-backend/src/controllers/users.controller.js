const UsersModel = require("../models/users.model");
const { success, error } = require("../utils/apiResponse");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { users, total } = await UsersModel.findAll({
      search,
      role,
      limit: parseInt(limit),
      offset,
    });

    return success(res, {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.id);
    if (!user) return error(res, "User not found.", 404);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/users/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);

    if (targetId === req.user.id)
      return error(res, "You cannot delete your own account.", 400);

    const target = await UsersModel.findById(targetId);
    if (!target) return error(res, "User not found.", 404);

    if (target.role === "Administrator")
      return error(res, "Administrator accounts cannot be deleted.", 403);

    await UsersModel.softDelete(targetId);
    await UsersModel.logAdminAction({
      adminId: req.user.id,
      action: "delete_user",
      entityId: targetId,
      oldValue: {
        name: `${target.first_name} ${target.last_name}`,
        email: target.email,
      },
      ip: req.ip,
    });

    return success(res, {}, "User deleted successfully.");
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/users/:id/verify
// ─────────────────────────────────────────────────────────────────────────────
const verifyUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    const target = await UsersModel.findById(targetId);
    if (!target) return error(res, "User not found.", 404);

    const newStatus = await UsersModel.toggleVerified(
      targetId,
      target.is_verified,
    );
    const action = newStatus ? "verify_user" : "unverify_user";

    await UsersModel.logAdminAction({
      adminId: req.user.id,
      action,
      entityId: targetId,
      ip: req.ip,
    });

    return success(
      res,
      { is_verified: newStatus },
      newStatus
        ? "User verified successfully."
        : "User unverified successfully.",
    );
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/users/:id/role
// Body: { role: "Student" | "Staff" | "Administrator" }
// ─────────────────────────────────────────────────────────────────────────────
const changeUserRole = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id);
    const { role } = req.body;

    if (!["Student", "Staff", "Administrator"].includes(role))
      return error(res, "Invalid role.", 400);
    if (targetId === req.user.id)
      return error(res, "You cannot change your own role.", 400);

    const target = await UsersModel.findById(targetId);
    if (!target) return error(res, "User not found.", 404);

    await UsersModel.updateRole(targetId, role);
    await UsersModel.logAdminAction({
      adminId: req.user.id,
      action: "change_user_role",
      entityId: targetId,
      oldValue: { role: target.role },
      newValue: { role },
      ip: req.ip,
    });

    return success(res, { role }, `User role changed to ${role}.`);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  deleteUser,
  verifyUser,
  changeUserRole,
};
