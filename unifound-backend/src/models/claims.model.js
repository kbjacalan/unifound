const supabase = require("../config/db");
const NotificationsModel = require("./notifications.model");

/**
 * Submit a new claim.
 */
const createClaim = async ({ itemId, claimantId, message }) => {
  // 1. Fetch item + status
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("id, name, reporter_id, item_statuses ( name )")
    .eq("id", itemId)
    .eq("is_active", true)
    .single();

  if (itemError || !item) throw new Error("Item not found.");

  if (item.reporter_id === claimantId)
    throw new Error("You cannot claim your own report.");

  const statusName = item.item_statuses?.name;
  if (statusName !== "lost" && statusName !== "found")
    throw new Error("This item is no longer accepting claims.");

  // 2. Prevent duplicate pending claim
  const { count: existingCount } = await supabase
    .from("claims")
    .select("id", { count: "exact", head: true })
    .eq("item_id", itemId)
    .eq("claimant_id", claimantId)
    .eq("status", "pending");

  if (existingCount > 0)
    throw new Error("You already have a pending claim on this item.");

  // 3. Insert claim
  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .insert({
      item_id: itemId,
      claimant_id: claimantId,
      message: message || null,
    })
    .select("id")
    .single();

  if (claimError) throw new Error(claimError.message);

  // 4. Fetch claimant name for notification
  const { data: claimant } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", claimantId)
    .single();

  const claimantName = claimant
    ? `${claimant.first_name} ${claimant.last_name}`
    : "A user";

  // 5. Notify reporter
  await NotificationsModel.createNotification({
    userId: item.reporter_id,
    type: "message",
    title: `Someone claims "${item.name}"`,
    body: `${claimantName} has submitted a claim and has been given your contact info. Approve once the item is physically returned.`,
    itemId,
  });

  return claim.id;
};

/**
 * Get all pending claims on items reported by `reporterId`.
 */
const findIncomingClaims = async (reporterId) => {
  // First get item IDs reported by this user
  const { data: reporterItems, error: itemsError } = await supabase
    .from("items")
    .select("id")
    .eq("reporter_id", reporterId)
    .eq("is_active", true);

  if (itemsError) throw new Error(itemsError.message);
  if (!reporterItems?.length) return [];

  const itemIds = reporterItems.map((i) => i.id);

  const { data, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      item_id,
      message,
      status,
      created_at,
      items ( name, reference_number ),
      users ( first_name, last_name, email, avatar_initials )
    `,
    )
    .in("item_id", itemIds)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    item_id: row.item_id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    item_name: row.items?.name ?? null,
    reference_number: row.items?.reference_number ?? null,
    claimant_first_name: row.users?.first_name ?? null,
    claimant_last_name: row.users?.last_name ?? null,
    claimant_email: row.users?.email ?? null,
    avatar_initials: row.users?.avatar_initials ?? null,
  }));
};

/**
 * Get all claims (all statuses) for a specific item — reporter only.
 */
const findClaimsByItem = async (itemId, reporterId) => {
  // Verify ownership first
  const { data: itemCheck } = await supabase
    .from("items")
    .select("id")
    .eq("id", itemId)
    .eq("reporter_id", reporterId)
    .maybeSingle();

  if (!itemCheck) throw new Error("Item not found or not authorized.");

  const { data, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      item_id,
      message,
      status,
      created_at,
      users ( first_name, last_name, email, avatar_initials )
    `,
    )
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    item_id: row.item_id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    claimant_first_name: row.users?.first_name ?? null,
    claimant_last_name: row.users?.last_name ?? null,
    claimant_email: row.users?.email ?? null,
    avatar_initials: row.users?.avatar_initials ?? null,
  }));
};

/**
 * Get claims made BY the logged-in user.
 */
const findMyClaims = async (claimantId) => {
  const { data, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      item_id,
      message,
      status,
      created_at,
      reviewed_at,
      items (
        name,
        reference_number,
        item_statuses ( label ),
        users ( first_name, last_name )
      )
    `,
    )
    .eq("claimant_id", claimantId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    item_id: row.item_id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    reviewed_at: row.reviewed_at ?? null,
    item_name: row.items?.name ?? null,
    reference_number: row.items?.reference_number ?? null,
    item_status_label: row.items?.item_statuses?.label ?? null,
    reporter_first_name: row.items?.users?.first_name ?? null,
    reporter_last_name: row.items?.users?.last_name ?? null,
  }));
};

/**
 * Approve a claim — marks item as claimed, rejects other pending claims.
 */
const approveClaim = async (claimId, reporterId) => {
  // 1. Fetch the claim
  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .select("id, claimant_id, item_id")
    .eq("id", claimId)
    .eq("status", "pending")
    .maybeSingle();

  if (claimError || !claim)
    throw new Error("Claim not found or you are not authorized.");

  // 2. Verify the item belongs to the reporter
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("name, status_id, reporter_id")
    .eq("id", claim.item_id)
    .eq("reporter_id", reporterId)
    .maybeSingle();

  if (itemError || !item)
    throw new Error("Claim not found or you are not authorized.");

  // 2. Get 'claimed' status id
  const { data: claimedStatus } = await supabase
    .from("item_statuses")
    .select("id")
    .eq("name", "claimed")
    .single();

  const claimedStatusId = claimedStatus.id;
  const oldStatusId = item.status_id;

  // 3. Approve this claim
  const { error: approveError } = await supabase
    .from("claims")
    .update({
      status: "approved",
      reviewed_by: reporterId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (approveError) throw new Error(approveError.message);

  // 4. Reject all other pending claims on the same item
  await supabase
    .from("claims")
    .update({
      status: "rejected",
      reviewed_by: reporterId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("item_id", claim.item_id)
    .neq("id", claimId)
    .eq("status", "pending");

  // 5. Update item status to claimed
  await supabase
    .from("items")
    .update({ status_id: claimedStatusId })
    .eq("id", claim.item_id);

  // 6. Log status history
  await supabase.from("item_status_history").insert({
    item_id: claim.item_id,
    old_status_id: oldStatusId,
    new_status_id: claimedStatusId,
    changed_by: reporterId,
  });

  // 7. Notify claimant
  await NotificationsModel.createNotification({
    userId: claim.claimant_id,
    type: "claimed",
    title: `Your claim was approved! 🎉`,
    body: `The reporter has confirmed the handoff for "${item.name}". This case is now closed.`,
    itemId: claim.item_id,
  });

  return true;
};

/**
 * Reject a claim.
 */
const rejectClaim = async (claimId, reporterId) => {
  // 1. Fetch the claim
  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .select("id, claimant_id, item_id")
    .eq("id", claimId)
    .eq("status", "pending")
    .maybeSingle();

  if (claimError || !claim)
    throw new Error("Claim not found or you are not authorized.");

  // 2. Verify item belongs to reporter
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("name, reporter_id")
    .eq("id", claim.item_id)
    .eq("reporter_id", reporterId)
    .maybeSingle();

  if (itemError || !item)
    throw new Error("Claim not found or you are not authorized.");

  const { error: rejectError } = await supabase
    .from("claims")
    .update({
      status: "rejected",
      reviewed_by: reporterId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", claimId);

  if (rejectError) throw new Error(rejectError.message);

  await NotificationsModel.createNotification({
    userId: claim.claimant_id,
    type: "alert",
    title: `Your claim was not approved`,
    body: `Your claim for "${item.name}" was reviewed and rejected by the reporter.`,
    itemId: claim.item_id,
  });

  return true;
};

/**
 * Check if a user has an existing claim on a specific item.
 */
const findExistingClaim = async (itemId, claimantId) => {
  const { data, error } = await supabase
    .from("claims")
    .select("id, status")
    .eq("item_id", itemId)
    .eq("claimant_id", claimantId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
};

module.exports = {
  createClaim,
  findIncomingClaims,
  findClaimsByItem,
  findMyClaims,
  approveClaim,
  rejectClaim,
  findExistingClaim,
};
