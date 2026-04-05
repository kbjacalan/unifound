const AdminItemsModel = require("../models/admin.items.model");
const { success, error } = require("../utils/apiResponse");

const getAllItems = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { items, total } = await AdminItemsModel.findAll({
      search,
      status,
      limit: parseInt(limit),
      offset,
    });

    return success(res, {
      items,
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

const getItemById = async (req, res, next) => {
  try {
    const item = await AdminItemsModel.findById(req.params.id);
    if (!item) return error(res, "Item not found.", 404);
    return success(res, { item });
  } catch (err) {
    next(err);
  }
};

const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const itemId = parseInt(req.params.id);

    const allowed = ["lost", "found", "claimed", "resolved"];
    if (!allowed.includes(status)) {
      return error(
        res,
        `Invalid status. Must be one of: ${allowed.join(", ")}.`,
        400,
      );
    }

    const item = await AdminItemsModel.findById(itemId);
    if (!item) return error(res, "Item not found.", 404);

    if (item.status === status) {
      return error(res, `Item is already marked as "${status}".`, 400);
    }

    await AdminItemsModel.updateStatus(itemId, status, req.user.id);

    await AdminItemsModel.logAdminAction({
      adminId: req.user.id,
      action: "update_item_status",
      entityId: itemId,
      oldValue: { status: item.status },
      newValue: { status },
      ip: req.ip,
    });

    const updated = await AdminItemsModel.findById(itemId);
    return success(
      res,
      { item: updated },
      `Item status updated to "${status}".`,
    );
  } catch (err) {
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);

    const item = await AdminItemsModel.findById(itemId);
    if (!item) return error(res, "Item not found.", 404);

    await AdminItemsModel.softDelete(itemId);

    await AdminItemsModel.logAdminAction({
      adminId: req.user.id,
      action: "delete_item",
      entityId: itemId,
      oldValue: { name: item.name, ref: item.reference_number },
      ip: req.ip,
    });

    return success(res, {}, "Item deleted successfully.");
  } catch (err) {
    next(err);
  }
};

const deleteItemsBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return error(res, "Provide an array of item IDs to delete.", 400);
    }

    // Only delete valid integers
    const validIds = ids
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);
    if (!validIds.length) {
      return error(res, "No valid item IDs provided.", 400);
    }

    await AdminItemsModel.softDeleteBulk(validIds);

    await AdminItemsModel.logAdminAction({
      adminId: req.user.id,
      action: "bulk_delete_items",
      entityId: null,
      newValue: { deleted_ids: validIds },
      ip: req.ip,
    });

    return success(
      res,
      { deleted: validIds.length },
      `${validIds.length} item(s) deleted successfully.`,
    );
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllItems,
  getItemById,
  updateItemStatus,
  deleteItem,
  deleteItemsBulk,
};
