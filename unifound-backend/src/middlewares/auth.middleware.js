const supabase = require("../config/db");
const { error } = require("../utils/apiResponse");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return error(res, "Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token against Supabase Auth
    const { data, error: authError } = await supabase.auth.getUser(token);

    if (authError || !data?.user) {
      return error(res, "Invalid or expired token.", 401);
    }

    // Fetch the user's profile + role from public.users
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        avatar_initials,
        is_active,
        user_roles ( roles ( name ) )
      `,
      )
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return error(res, "User profile not found.", 401);
    }

    if (!profile.is_active) {
      return error(res, "Account is deactivated.", 403);
    }

    // Attach to req.user for use in controllers
    req.user = {
      id: profile.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      avatar_initials: profile.avatar_initials,
      role: profile.user_roles?.[0]?.roles?.name ?? "Student",
    };

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate };
