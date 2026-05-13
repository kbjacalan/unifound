const supabase = require("../config/db");

const getCategoryId = async (categoryName) => {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("name", categoryName)
    .single();

  if (error || !data) return null;
  return data.id;
};

const getStatusId = async (statusName = "lost") => {
  const { data, error } = await supabase
    .from("item_statuses")
    .select("id")
    .eq("name", statusName)
    .single();

  if (error || !data) return 1;
  return data.id;
};

const generateRefNumber = async () => {
  const year = new Date().getFullYear();
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;

  const { count } = await supabase
    .from("items")
    .select("id", { count: "exact", head: true })
    .gte("created_at", start)
    .lte("created_at", end);

  const next = ((count ?? 0) + 1).toString().padStart(4, "0");
  return `LF-${year}-${next}`;
};

const findById = async (itemId) => {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      id,
      reference_number,
      name,
      description,
      location,
      date_reported,
      time_reported,
      contact_email,
      created_at,
      reporter_id,
      categories ( name ),
      item_statuses ( name, label ),
      users (
        first_name,
        last_name,
        email,
        avatar_initials
      ),
      item_images ( image_path, is_primary )
    `,
    )
    .eq("id", itemId)
    .maybeSingle();

  if (error || !data) return null;
  return _shape(data);
};

/**
 * Create an item, optional primary image, and initial status history
 * — all in sequence (Supabase JS v2 has no built-in transactions;
 *   we throw on any error so the caller can surface it).
 */
const createItem = async ({
  refNumber,
  name,
  description,
  categoryId,
  statusId,
  location,
  dateReported,
  reporterId,
  contactEmail,
  imagePath = null,
}) => {
  // 1. Insert item
  const { data: item, error: itemError } = await supabase
    .from("items")
    .insert({
      reference_number: refNumber,
      name,
      description,
      category_id: categoryId,
      status_id: statusId,
      location,
      date_reported: dateReported,
      reporter_id: reporterId,
      contact_email: contactEmail,
    })
    .select("id")
    .single();

  if (itemError) throw new Error(itemError.message);

  const itemId = item.id;

  // 2. Insert primary image if provided
  if (imagePath) {
    const { error: imgError } = await supabase
      .from("item_images")
      .insert({ item_id: itemId, image_path: imagePath, is_primary: true });

    if (imgError) throw new Error(imgError.message);
  }

  // 3. Log initial status history
  const { error: historyError } = await supabase
    .from("item_status_history")
    .insert({
      item_id: itemId,
      old_status_id: null,
      new_status_id: statusId,
      changed_by: reporterId,
    });

  if (historyError) throw new Error(historyError.message);

  return await findById(itemId);
};

const findAll = async ({
  status,
  category,
  search,
  sort = "newest",
  limit = 12,
  offset = 0,
}) => {
  const orderMap = {
    newest: { column: "created_at", ascending: false },
    oldest: { column: "created_at", ascending: true },
    name_asc: { column: "name", ascending: true },
    name_desc: { column: "name", ascending: false },
  };
  const order = orderMap[sort] ?? orderMap.newest;

  // Resolve status/category names to IDs upfront to avoid
  // unreliable joined-column filtering in Supabase JS v2
  let statusId = null;
  let categoryId = null;

  if (status) {
    const { data: s } = await supabase
      .from("item_statuses")
      .select("id")
      .eq("name", status)
      .maybeSingle();
    statusId = s?.id ?? null;
  }

  if (category) {
    const { data: c } = await supabase
      .from("categories")
      .select("id")
      .eq("name", category)
      .maybeSingle();
    categoryId = c?.id ?? null;
  }

  let query = supabase
    .from("items")
    .select(
      `
      id,
      reference_number,
      name,
      location,
      date_reported,
      contact_email,
      created_at,
      reporter_id,
      description,
      categories ( name ),
      item_statuses ( name, label ),
      users (
        first_name,
        last_name,
        email,
        avatar_initials
      ),
      item_images ( image_path, is_primary )
    `,
      { count: "exact" },
    )
    .eq("is_active", true)
    .order(order.column, { ascending: order.ascending })
    .range(offset, offset + limit - 1);

  if (statusId) query = query.eq("status_id", statusId);
  if (categoryId) query = query.eq("category_id", categoryId);

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`,
    );
  }

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { items: (data ?? []).map(_shape), total: count ?? 0 };
};

const findByReporter = async (reporterId) => {
  const { data, error } = await supabase
    .from("items")
    .select(
      `
      id,
      reference_number,
      name,
      description,
      location,
      date_reported,
      contact_email,
      created_at,
      reporter_id,
      categories ( name ),
      item_statuses ( name, label ),
      users (
        first_name,
        last_name,
        email,
        avatar_initials
      ),
      item_images ( image_path, is_primary )
    `,
    )
    .eq("reporter_id", reporterId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(_shape);
};

const updateItem = async (
  itemId,
  {
    name,
    description,
    categoryId,
    statusId,
    location,
    dateReported,
    contactEmail,
    imagePath,
    reporterId,
  },
) => {
  // 1. Fetch current item to verify ownership + get old status
  const { data: current, error: fetchError } = await supabase
    .from("items")
    .select("status_id")
    .eq("id", itemId)
    .eq("reporter_id", reporterId)
    .maybeSingle();

  if (fetchError || !current)
    throw new Error("Item not found or not authorized.");

  const oldStatusId = current.status_id;

  // 2. Build update payload — only include defined fields
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (description !== undefined) patch.description = description;
  if (categoryId !== undefined) patch.category_id = categoryId;
  if (statusId !== undefined) patch.status_id = statusId;
  if (location !== undefined) patch.location = location;
  if (dateReported !== undefined) patch.date_reported = dateReported;
  if (contactEmail !== undefined) patch.contact_email = contactEmail;

  if (Object.keys(patch).length > 0) {
    const { error: updateError } = await supabase
      .from("items")
      .update(patch)
      .eq("id", itemId)
      .eq("reporter_id", reporterId);

    if (updateError) throw new Error(updateError.message);
  }

  // 3. Handle image update
  if (imagePath !== undefined && imagePath !== null) {
    const { data: existing } = await supabase
      .from("item_images")
      .select("id")
      .eq("item_id", itemId)
      .eq("is_primary", true)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("item_images")
        .update({ image_path: imagePath })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("item_images")
        .insert({ item_id: itemId, image_path: imagePath, is_primary: true });
    }
  }

  // 4. Log status history if status changed
  if (statusId !== undefined && statusId !== oldStatusId) {
    await supabase.from("item_status_history").insert({
      item_id: itemId,
      old_status_id: oldStatusId,
      new_status_id: statusId,
      changed_by: reporterId,
    });
  }

  return await findById(itemId);
};

const softDelete = async (itemId, reporterId) => {
  // Verify ownership first
  const { data: item } = await supabase
    .from("items")
    .select("id")
    .eq("id", itemId)
    .eq("reporter_id", reporterId)
    .maybeSingle();

  if (!item) throw new Error("Item not found or not authorized.");

  const { error } = await supabase
    .from("items")
    .update({ is_active: false })
    .eq("id", itemId);

  if (error) throw new Error(error.message);
};

// ─── Internal shape helper ────────────────────────────────────────────────────
// Flattens Supabase's nested join objects into the flat shape
// the controllers and frontend already expect.
const _shape = (row) => {
  const primaryImage = row.item_images?.find((img) => img.is_primary);
  return {
    id: row.id,
    reference_number: row.reference_number,
    name: row.name,
    description: row.description ?? null,
    category: row.categories?.name ?? null,
    status: row.item_statuses?.name ?? null,
    status_label: row.item_statuses?.label ?? null,
    location: row.location,
    date_reported: row.date_reported,
    time_reported: row.time_reported ?? null,
    contact_email: row.contact_email ?? null,
    created_at: row.created_at,
    reporter_id: row.reporter_id,
    reporter_first_name: row.users?.first_name ?? null,
    reporter_last_name: row.users?.last_name ?? null,
    reporter_email: row.users?.email ?? null,
    avatar_initials: row.users?.avatar_initials ?? null,
    image: primaryImage?.image_path ?? null,
  };
};

module.exports = {
  getCategoryId,
  getStatusId,
  generateRefNumber,
  findById,
  createItem,
  findAll,
  findByReporter,
  updateItem,
  softDelete,
};
