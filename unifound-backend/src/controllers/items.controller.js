const ItemsModel = require("../models/items.model");
const { success, error } = require("../utils/apiResponse");
const { uploadToSupabase } = require("../middlewares/upload.middleware");

const createItem = async (req, res, next) => {
  try {
    const {
      status = "lost",
      name,
      category,
      location,
      dateReported,
      contactEmail,
      description,
    } = req.body;

    // Validation
    const errs = {};
    if (!name?.trim()) errs.name = "Item name is required.";
    if (!category?.trim()) errs.category = "Category is required.";
    if (!location?.trim()) errs.location = "Location is required.";
    if (!dateReported) errs.dateReported = "Date is required.";
    if (!contactEmail?.trim()) errs.contactEmail = "Contact email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
      errs.contactEmail = "Invalid email address.";

    if (Object.keys(errs).length) {
      return error(res, "Validation failed.", 400, errs);
    }

    const categoryId = await ItemsModel.getCategoryId(category);
    if (!categoryId) {
      return error(res, `Category "${category}" not found.`, 400);
    }

    const statusId = await ItemsModel.getStatusId(status);
    const refNumber = await ItemsModel.generateRefNumber();
    const imagePath = req.file ? await uploadToSupabase(req.file) : null;

    const item = await ItemsModel.createItem({
      refNumber,
      name: name.trim(),
      description: description?.trim() || null,
      categoryId,
      statusId,
      location: location.trim(),
      dateReported,
      reporterId: req.user.id,
      contactEmail: contactEmail.trim(),
      imagePath,
    });

    return success(res, { item }, "Item reported successfully.", 201);
  } catch (err) {
    next(err);
  }
};

const getItems = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      sort = "newest",
      page = 1,
      limit = 12,
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { items, total } = await ItemsModel.findAll({
      status,
      category,
      search,
      sort,
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

const getMyReports = async (req, res, next) => {
  try {
    const items = await ItemsModel.findByReporter(req.user.id);
    return success(res, { items });
  } catch (err) {
    next(err);
  }
};

const getItemDetail = async (req, res, next) => {
  try {
    const item = await ItemsModel.findById(req.params.id);
    if (!item) return error(res, "Item not found.", 404);
    return success(res, { item });
  } catch (err) {
    next(err);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const {
      name,
      category,
      status,
      location,
      dateReported,
      contactEmail,
      description,
    } = req.body;

    const errs = {};
    if (name !== undefined && !name?.trim())
      errs.name = "Item name is required.";
    if (location !== undefined && !location?.trim())
      errs.location = "Location is required.";
    if (dateReported !== undefined && !dateReported)
      errs.dateReported = "Date is required.";
    if (contactEmail !== undefined) {
      if (!contactEmail?.trim())
        errs.contactEmail = "Contact email is required.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))
        errs.contactEmail = "Invalid email address.";
    }

    if (Object.keys(errs).length) {
      return error(res, "Validation failed.", 400, errs);
    }

    let categoryId;
    if (category) {
      categoryId = await ItemsModel.getCategoryId(category);
      if (!categoryId) {
        return error(res, `Category "${category}" not found.`, 400);
      }
    }

    let statusId;
    if (status) {
      statusId = await ItemsModel.getStatusId(status);
    }

    const imagePath = req.file ? await uploadToSupabase(req.file) : undefined;

    const item = await ItemsModel.updateItem(itemId, {
      name: name?.trim(),
      description:
        description !== undefined ? description?.trim() || null : undefined,
      categoryId,
      statusId,
      location: location?.trim(),
      dateReported,
      contactEmail: contactEmail?.trim(),
      imagePath,
      reporterId: req.user.id,
    });

    return success(res, { item }, "Item updated successfully.");
  } catch (err) {
    if (err.message === "Item not found or not authorized.") {
      return error(res, err.message, 403);
    }
    next(err);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    await ItemsModel.softDelete(itemId, req.user.id);
    return success(res, {}, "Item deleted successfully.");
  } catch (err) {
    if (err.message === "Item not found or not authorized.") {
      return error(res, err.message, 403);
    }
    next(err);
  }
};

module.exports = {
  createItem,
  getItems,
  getMyReports,
  getItemDetail,
  updateItem,
  deleteItem,
};
