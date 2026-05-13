const AuthModel = require("../models/auth.model");
const { success, error } = require("../utils/apiResponse");

const signup = async (req, res, next) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role = "Student",
    } = req.body;

    if (!first_name || !last_name || !email || !password)
      return error(res, "All fields are required.", 400);
    if (password.length < 6)
      return error(res, "Password must be at least 6 characters.", 400);
    if (!["Student", "Staff"].includes(role))
      return error(res, "Invalid role. Must be Student or Staff.", 400);

    if (await AuthModel.emailExists(email))
      return error(res, "Email is already registered.", 409);

    const user = await AuthModel.createUser(
      first_name,
      last_name,
      email,
      password, // plain — Supabase Auth hashes it
      role,
    );

    return success(res, { user }, "Account created successfully.", 201);
  } catch (err) {
    // Surface Supabase-specific messages cleanly
    if (err.message?.toLowerCase().includes("already registered"))
      return error(res, "Email is already registered.", 409);
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return error(res, "Email and password are required.", 400);

    // Supabase Auth sign-in — returns session + user on success, null on failure
    const session = await AuthModel.signIn(email, password);
    if (!session) return error(res, "Invalid email or password.", 401);

    // Fetch full profile (with role) from public.users
    const user = await AuthModel.findByEmail(email);
    if (!user) return error(res, "User profile not found.", 404);

    if (!user.is_active) return error(res, "Account is deactivated.", 403);

    await AuthModel.updateLastLogin(user.id);

    return success(
      res,
      {
        token: session.session.access_token,
        user,
      },
      "Login successful.",
    );
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    // req.user is set by auth.middleware after token verification
    const user = await AuthModel.findById(req.user.id);
    if (!user) return error(res, "User not found.", 404);
    return success(res, { user }, "User fetched successfully.");
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
