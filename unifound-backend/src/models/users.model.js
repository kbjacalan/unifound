const supabase = require("../config/db");

const findById = async (userId) => {
  // Fetch profile + role
  const { data: user, error: userError } = await supabase
    .from("users")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      avatar_initials,
      is_active,
      last_login_at,
      created_at,
      user_roles ( roles ( name ) )
    `,
    )
    .eq("id", userId)
    .maybeSingle();

  if (userError || !user) return null;

  // Count active reports separately
  const { count } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true })
    .eq("reporter_id", userId)
    .eq("is_active", true);

  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    avatar_initials: user.avatar_initials,
    is_active: user.is_active,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
    role: user.user_roles?.[0]?.roles?.name ?? "Student",
    report_count: count ?? 0,
  };
};

const updateRole = async (userId, roleName) => {
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .maybeSingle();

  if (roleError || !role) throw new Error(`Role "${roleName}" not found.`);

  const { error: updateError } = await supabase
    .from("user_roles")
    .update({ role_id: role.id })
    .eq("user_id", userId);

  if (updateError) throw new Error(updateError.message);
};

module.exports = {
  findById,
  updateRole,
};
