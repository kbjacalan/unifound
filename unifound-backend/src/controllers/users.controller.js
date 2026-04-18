const UsersModel = require("../models/users.model");
const { success, error } = require("../utils/apiResponse");

// Get own profile (any authenticated user)
const getProfile = async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user.id);
    if (!user) return error(res, "User not found.", 404);
    return success(res, { user });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile };
