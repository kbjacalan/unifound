const fs = require("fs");
const ItemsModel = require("../models/items.model");
const { success, error } = require("../utils/apiResponse");

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
      if (req.file) fs.unlinkSync(req.file.path);
      return error(res, "Validation failed.", 400, errs);
    }

    const categoryId = await ItemsModel.getCategoryId(category);
    if (!categoryId) {
      if (req.file) fs.unlinkSync(req.file.path);
      return error(res, `Category "${category}" not found.`, 400);
    }

    const statusId = await ItemsModel.getStatusId(status);
    const refNumber = await ItemsModel.generateRefNumber();
    const imagePath = req.file ? `/uploads/items/${req.file.filename}` : null;

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
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    return success(res, { item }, "Item reported successfully.", 201);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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

module.exports = { createItem, getItems, getMyReports, getItemDetail };
