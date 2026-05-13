const supabase = require("../config/db");

/**
 * Find a user profile + role by email.
 * Used after Supabase Auth sign-in to return full profile.
 */
const findByEmail = async (email) => {
  const { data, error } = await supabase
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
    .eq("email", email)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    role: data.user_roles?.[0]?.roles?.name ?? "Student",
  };
};

/**
 * Find a user profile + role by UUID.
 */
const findById = async (id) => {
  const { data, error } = await supabase
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
    .eq("id", id)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;

  return {
    ...data,
    role: data.user_roles?.[0]?.roles?.name ?? "Student",
  };
};

/**
 * Check if an email is already registered in public.users.
 */
const emailExists = async (email) => {
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("email", email);

  return count > 0;
};

/**
 * Register a new user via Supabase Auth, then update the
 * public.users row (created by the post-signup trigger) with
 * avatar_initials and assign the chosen role.
 */
const createUser = async (firstName, lastName, email, password, roleName) => {
  // 1. Create auth user — Supabase sends a confirmation email if enabled
  const { data: authData, error: signUpError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm; set false if you want email verification
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
      },
    });

  if (signUpError) throw new Error(signUpError.message);

  const userId = authData.user.id;
  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

  // 2. Update the public.users row created by the trigger
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_initials: initials })
    .eq("id", userId);

  if (updateError) throw new Error(updateError.message);

  // 3. Look up the role and assign it
  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (roleError) throw new Error(`Role "${roleName}" not found.`);

  const { error: roleAssignError } = await supabase
    .from("user_roles")
    .insert({ user_id: userId, role_id: roleRow.id });

  if (roleAssignError) throw new Error(roleAssignError.message);

  return await findById(userId);
};

/**
 * Sign in with email + password via Supabase Auth.
 * Returns the session (contains access_token) + user profile.
 */
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return null;
  return data; // { session, user }
};

/**
 * Update last_login_at timestamp on public.users.
 */
const updateLastLogin = async (userId) => {
  await supabase
    .from("users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);
};

module.exports = {
  findByEmail,
  findById,
  emailExists,
  createUser,
  signIn,
  updateLastLogin,
};
