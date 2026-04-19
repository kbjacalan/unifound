import { useState, useEffect } from "react";
import {
  MapPin,
  Tag,
  Calendar,
  User,
  PackageSearch,
  ArrowLeft,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  Search,
  XCircle,
  Loader,
  Info,
  Pencil,
  Trash2,
  HelpCircle,
  Mail,
} from "lucide-react";
import { useAuth } from "../../providers/AuthProvider";
import EditItemForm from "../EditItemForm/EditItemForm";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import ClaimModal from "../ClaimModal/ClaimModal";
import IncomingClaims from "../IncomingClaims/IncomingClaims";
import "./ItemDetail.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const STATUS_CONFIG = {
  lost: {
    label: "Lost",
    className: "status--lost",
    icon: AlertCircle,
    description:
      "This item has been reported as lost and is currently being searched for.",
  },
  found: {
    label: "Found",
    className: "status--found",
    icon: Search,
    description:
      "This item has been found and is available for claiming at the reported location.",
  },
  claimed: {
    label: "Claimed",
    className: "status--claimed",
    icon: CheckCircle2,
    description:
      "This item has been successfully returned to its owner. Case closed.",
  },
  resolved: {
    label: "Resolved",
    className: "status--resolved",
    icon: XCircle,
    description: "This case has been fully resolved and closed.",
  },
};

const ItemDetail = ({ item: listItem, onBack }) => {
  const { user } = useAuth();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [existingClaim, setExistingClaim] = useState(null);
  const [claimCheckDone, setClaimCheckDone] = useState(false);
  const [incomingClaimsKey, setIncomingClaimsKey] = useState(0);

  const fetchDetail = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load item details.");
      }

      const data = await res.json();
      const raw = data.data?.item;

      setDetail({
        id: raw.id,
        name: raw.name,
        status: raw.status,
        status_label: raw.status_label,
        category: raw.category,
        location: raw.location,
        reporter_id: raw.reporter_id,
        dateReported: raw.date_reported
          ? new Date(raw.date_reported).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "—",
        timeReported: raw.time_reported
          ? new Date(`1970-01-01T${raw.time_reported}`).toLocaleTimeString(
              "en-US",
              { hour: "2-digit", minute: "2-digit" },
            )
          : "—",
        reporterName:
          raw.reporter_first_name && raw.reporter_last_name
            ? `${raw.reporter_first_name} ${raw.reporter_last_name}`
            : "Unknown",
        reporterEmail: raw.reporter_email ?? null,
        image: raw.image ? `${API_URL}${raw.image}` : null,
        description:
          raw.description ||
          "No additional description has been provided for this item. If you have more information, please contact the reporter directly or reach out to the Lost & Found office.",
        contactEmail: raw.contact_email || "unifound@gmail.com",
        referenceNumber: raw.reference_number || "—",
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!listItem?.id) return;
    fetchDetail(listItem.id);
    setClaimCheckDone(false);
    setExistingClaim(null);
  }, [listItem?.id]);

  // Check existing claim once detail is loaded (non-owners only)
  useEffect(() => {
    if (!detail) return;
    const isOwn =
      user?.email &&
      detail.reporterEmail &&
      user.email.toLowerCase() === detail.reporterEmail.toLowerCase();
    if (!isOwn) {
      checkExistingClaim(detail.id);
    } else {
      setClaimCheckDone(true);
    }
  }, [detail?.id]);

  const checkExistingClaim = async (itemId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/claims/check/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setExistingClaim(data.data?.claim ?? null);
    } catch {
      setExistingClaim(null);
    } finally {
      setClaimCheckDone(true);
    }
  };

  const handleClaimSubmitted = () => {
    checkExistingClaim(detail.id);
  };

  const handleClaimActioned = () => {
    fetchDetail(listItem.id);
    setIncomingClaimsKey((k) => k + 1);
  };

  const handleSaved = () => {
    fetchDetail(listItem.id);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/items/${detail.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete item.");
      onBack();
    } catch {
      // silently handle; modal already closed
    } finally {
      setDeleting(false);
    }
  };

  const item = detail ?? listItem;
  const status = STATUS_CONFIG[item?.status] ?? STATUS_CONFIG.lost;
  const StatusIcon = status.icon;

  const isOwnReport =
    user?.email &&
    item?.reporterEmail &&
    user.email.toLowerCase() === item.reporterEmail.toLowerCase();

  const isActionable = item?.status === "lost" || item?.status === "found";

  const hasPendingClaim = existingClaim?.status === "pending";
  const hasApprovedClaim = existingClaim?.status === "approved";

  // Claimant has submitted a claim (pending or approved) — show contact info
  const hasActiveClaim = hasPendingClaim || hasApprovedClaim;

  return (
    <>
      <div className="item-detail-overlay">
        <div className="item-detail-container">
          <button className="item-detail-back" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to List
          </button>

          {loading ? (
            <div className="item-detail-loading">
              <Loader size={32} className="item-list-spinner" />
              <p>Loading details…</p>
            </div>
          ) : error ? (
            <div className="item-detail-loading">
              <AlertCircle size={32} />
              <p>{error}</p>
            </div>
          ) : (
            <div className="item-detail-layout">
              {/* ── Left panel ── */}
              <div className="item-detail-image-panel">
                <div className="item-detail-image-wrap">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="item-detail-img"
                    />
                  ) : (
                    <div className="item-detail-img-placeholder">
                      <PackageSearch size={56} />
                      <span>No photo available</span>
                    </div>
                  )}
                  <span className={`item-detail-badge ${status.className}`}>
                    <span className="item-status-dot" />
                    {item.status_label || status.label}
                  </span>
                </div>

                <div className="item-detail-ref">
                  <span className="item-detail-ref-label">Reference No.</span>
                  <span className="item-detail-ref-value">
                    {item.referenceNumber}
                  </span>
                </div>

                <div
                  className={`item-detail-status-card ${status.className}-card`}
                >
                  <StatusIcon size={16} />
                  <p>{status.description}</p>
                </div>

                {/* ── Owner action buttons on left panel (desktop) ── */}
                {isOwnReport && (
                  <div className="item-detail-owner-actions">
                    {item?.status !== "claimed" && (
                      <button
                        className="item-detail-owner-btn item-detail-owner-btn--edit"
                        onClick={() => setShowEdit(true)}
                      >
                        <Pencil size={14} />
                        Edit Report
                      </button>
                    )}
                    <button
                      className="item-detail-owner-btn item-detail-owner-btn--delete"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleting}
                    >
                      <Trash2 size={14} />
                      {deleting ? "Deleting…" : "Delete Report"}
                    </button>
                  </div>
                )}
              </div>

              {/* ── Right panel ── */}
              <div className="item-detail-info-panel">
                <div className="item-detail-header">
                  <div className="item-detail-header-top">
                    <div>
                      <h1 className="item-detail-name">{item.name}</h1>
                      <p className="item-detail-category">{item.category}</p>
                    </div>
                  </div>
                </div>

                <div className="item-detail-section">
                  <h2 className="item-detail-section-title">
                    <FileText size={14} />
                    Description
                  </h2>
                  <p className="item-detail-description">{item.description}</p>
                </div>

                <div className="item-detail-section">
                  <h2 className="item-detail-section-title">
                    <Tag size={14} />
                    Item Details
                  </h2>
                  <div className="item-detail-grid">
                    <div className="item-detail-field">
                      <span className="item-detail-field-label">
                        <MapPin size={12} /> Location
                      </span>
                      <span className="item-detail-field-value">
                        {item.location}
                      </span>
                    </div>
                    <div className="item-detail-field">
                      <span className="item-detail-field-label">
                        <Calendar size={12} /> Date Reported
                      </span>
                      <span className="item-detail-field-value">
                        {item.dateReported}
                      </span>
                    </div>
                    <div className="item-detail-field">
                      <span className="item-detail-field-label">
                        <Clock size={12} /> Time Reported
                      </span>
                      <span className="item-detail-field-value">
                        {item.timeReported}
                      </span>
                    </div>
                    <div className="item-detail-field">
                      <span className="item-detail-field-label">
                        <User size={12} /> Reported By
                      </span>
                      <span className="item-detail-field-value">
                        {item.reporterName}
                        {isOwnReport && (
                          <span className="item-detail-own-badge">You</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Action area ── */}
                {isOwnReport ? (
                  <>
                    <div className="item-detail-own-notice">
                      <Info size={15} />
                      <p>
                        This is your report. Use the <strong>Edit</strong> or{" "}
                        <strong>Delete</strong> buttons to manage it.
                      </p>
                    </div>
                    {detail && (isActionable || item?.status === "claimed") && (
                      <div className="item-detail-section">
                        <IncomingClaims
                          key={incomingClaimsKey}
                          itemId={detail.id}
                          onClaimActioned={handleClaimActioned}
                        />
                      </div>
                    )}
                  </>
                ) : hasActiveClaim ? (
                  /* Claimant submitted a claim — show contact info immediately */
                  <div className="item-detail-actions">
                    <div className="item-detail-contact-reveal">
                      <div className="item-detail-contact-reveal-header">
                        {hasApprovedClaim ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Item Returned — Case Closed</span>
                          </>
                        ) : (
                          <>
                            <Mail size={16} />
                            <span>Contact the Reporter</span>
                          </>
                        )}
                      </div>
                      <p className="item-detail-contact-reveal-sub">
                        {hasApprovedClaim
                          ? "The reporter has confirmed the handoff. This case is now closed."
                          : "Your claim has been submitted. Reach out to the reporter directly to arrange the handoff."}
                      </p>
                      <a
                        className="item-detail-contact-reveal-email"
                        href={`mailto:${item.contactEmail}`}
                      >
                        {item.contactEmail}
                      </a>
                      <a
                        className="item-detail-btn item-detail-btn--primary"
                        href={`mailto:${item.contactEmail}`}
                        style={{
                          textAlign: "center",
                          marginTop: "4px",
                          textDecoration: "none",
                          display: "block",
                        }}
                      >
                        Send Email
                      </a>
                    </div>
                  </div>
                ) : isActionable ? (
                  <div className="item-detail-actions">
                    {!claimCheckDone ? (
                      <div className="item-detail-claim-checking">
                        <Loader size={14} className="item-list-spinner" />
                        <span>Checking claim status…</span>
                      </div>
                    ) : (
                      <button
                        className="item-detail-btn item-detail-btn--primary"
                        onClick={() => setShowClaimModal(true)}
                      >
                        {item.status === "lost"
                          ? "I Found This!"
                          : "This Is Mine"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="item-detail-own-notice">
                    <CheckCircle2 size={15} />
                    <p>
                      This case is already{" "}
                      <strong>{item.status_label || item.status}</strong> and is
                      no longer accepting claims.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Claim modal */}
      {showClaimModal && detail && (
        <ClaimModal
          item={detail}
          onClose={() => setShowClaimModal(false)}
          onSubmitted={handleClaimSubmitted}
        />
      )}

      {/* Edit slide-over */}
      {showEdit && detail && (
        <EditItemForm
          item={detail}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete this report?"
        message={`"${item?.name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ItemDetail;
