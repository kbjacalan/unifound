import { useState, useEffect, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Loader,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  PackageCheck,
} from "lucide-react";
import "./IncomingClaims.css";

const API_URL = "http://localhost:5000";

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const IncomingClaims = ({ itemId, onClaimActioned }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(null);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/claims/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load claims.");
      setClaims(data.data?.claims ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (itemId) fetchClaims();
  }, [itemId, fetchClaims]);

  const handleAction = async (claimId, action) => {
    setActionLoading(claimId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/claims/${claimId}/${action}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || `Failed to ${action} claim.`);

      await fetchClaims();
      if (onClaimActioned) onClaimActioned(action);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingClaims = claims.filter((c) => c.status === "pending");

  if (loading) {
    return (
      <div className="inc-claims-loading">
        <Loader size={16} className="inc-claims-spinner" />
        <span>Loading claims…</span>
      </div>
    );
  }

  if (claims.length === 0) return null;

  return (
    <div className="inc-claims-panel">
      <button
        className="inc-claims-toggle"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="inc-claims-toggle-left">
          <Users size={15} />
          <span>Incoming Claims</span>
          {pendingClaims.length > 0 && (
            <span className="inc-claims-badge">
              {pendingClaims.length} pending
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {expanded && (
        <div className="inc-claims-list">
          {error && <p className="inc-claims-error">{error}</p>}

          {claims.map((claim) => (
            <div
              key={claim.id}
              className={`inc-claim-item inc-claim-item--${claim.status}`}
            >
              <div className="inc-claim-top">
                <div className="inc-claim-avatar">
                  {claim.avatar_initials ||
                    `${claim.claimant_first_name?.[0] ?? ""}${claim.claimant_last_name?.[0] ?? ""}`}
                </div>
                <div className="inc-claim-info">
                  <span className="inc-claim-name">
                    {claim.claimant_first_name} {claim.claimant_last_name}
                  </span>
                  <span className="inc-claim-email">
                    {claim.claimant_email}
                  </span>
                </div>
                <div className="inc-claim-meta">
                  <span
                    className={`inc-claim-status-pill inc-claim-status--${claim.status}`}
                  >
                    {claim.status === "pending" && <Clock size={10} />}
                    {claim.status === "approved" && <CheckCircle2 size={10} />}
                    {claim.status === "rejected" && <XCircle size={10} />}
                    {claim.status}
                  </span>
                  <span className="inc-claim-time">
                    {timeAgo(claim.created_at)}
                  </span>
                </div>
              </div>

              {claim.message && (
                <div className="inc-claim-message">
                  <MessageSquare size={11} />
                  <p>{claim.message}</p>
                </div>
              )}

              {claim.status === "pending" && (
                <>
                  <p className="inc-claim-confirm-hint">
                    This person has been given your contact info. Once the item
                    is physically returned, confirm it below.
                  </p>
                  <div className="inc-claim-actions">
                    <button
                      className="inc-claim-btn inc-claim-btn--approve"
                      onClick={() => handleAction(claim.id, "approve")}
                      disabled={actionLoading === claim.id}
                    >
                      {actionLoading === claim.id ? (
                        <Loader size={12} className="inc-claims-spinner" />
                      ) : (
                        <PackageCheck size={12} />
                      )}
                      Confirm Returned
                    </button>
                    <button
                      className="inc-claim-btn inc-claim-btn--reject"
                      onClick={() => handleAction(claim.id, "reject")}
                      disabled={actionLoading === claim.id}
                    >
                      <XCircle size={12} />
                      Reject
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingClaims;
