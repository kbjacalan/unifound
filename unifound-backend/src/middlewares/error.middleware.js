const { error } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  if (err.code === "ER_DUP_ENTRY") {
    return error(res, "Email is already registered.", 409);
  }

  return error(
    res,
    err.message || "Internal server error",
    err.statusCode || 500,
  );
};

module.exports = errorHandler;
