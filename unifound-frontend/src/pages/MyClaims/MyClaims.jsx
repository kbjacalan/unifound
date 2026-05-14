import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  XCircle,
  PackageSearch,
  ExternalLink,
  MessageSquare,
  Calendar,
  Hash,
  User,
  Filter,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSidebar } from "../../providers/SidebarProvider";
import "./MyClaims.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    badgeClass: "claim-status--pending",
    iconClass: "claim-icon--pending",
    pipClass: "claim-pip--pending",
  },
  approved: {
    icon: CheckCircle2,
    label: "Returned",
    badgeClass: "claim-status--approved",
    iconClass: "claim-icon--approved",
    pipClass: "claim-pip--approved",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    badgeClass: "claim-status--rejected",
    iconClass: "claim-icon--rejected",
    pipClass: "claim-pip--rejected",
  },
};

const FILTERS = ["All", "Pending", "Returned", "Rejected"];

/* ── Skeleton for a single claim card ── */
const ClaimCardSkeleton = () => (
  <div className="claim-card" style={{ pointerEvents: "none" }}>
    {/* Left pip — 4px wide, 48px tall */}
    <span className="claim-status-pip" style={{ background: "#e2e8f0" }} />

    {/* Icon wrap — 38×38, border-radius 10px */}
    <Skeleton
      width={38}
      height={38}
      style={{ borderRadius: 10, flexShrink: 0 }}
    />

    {/* Card body */}
    <div className="claim-card-body">
      {/* Top row: status badge + time */}
      <div className="claim-card-top">
        <Skeleton width={64} height={20} style={{ borderRadius: 20 }} />
        <div style={{ marginLeft: "auto" }}>
          <Skeleton width={48} height={11} />
        </div>
      </div>

      {/* Item name — 13.5px bold */}
      <Skeleton width="60%" height={14} style={{ marginTop: 2 }} />

      {/* Meta row — ref + reporter */}
      <div className="claim-card-meta" style={{ marginTop: 2 }}>
        <Skeleton width={80} height={12} />
        <Skeleton width={90} height={12} />
      </div>

      {/* View Item link */}
      <Skeleton
        width={68}
        height={12}
        style={{ marginTop: 6, borderRadius: 4 }}
      />
    </div>
  </div>
);

const ClaimCard = ({ claim, index }) => {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[claim.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = config.icon;

  return (
    <div className="claim-card" style={{ animationDelay: `${index * 0.05}s` }}>
      <span className={`claim-status-pip ${config.pipClass}`} />

      <div className={`claim-icon-wrap ${config.iconClass}`}>
        <StatusIcon size={16} />
      </div>

      <div className="claim-card-body">
        <div className="claim-card-top">
          <span className={`claim-status-badge ${config.badgeClass}`}>
            {config.label}
          </span>
          <span className="claim-time">
            <Clock size={11} />
            {timeAgo(claim.created_at)}
          </span>
        </div>

        <h3 className="claim-card-item-name">{claim.item_name}</h3>

        <div className="claim-card-meta">
          <span className="claim-meta-item">
            <Hash size={11} />
            {claim.reference_number}
          </span>
          <span className="claim-meta-item">
            <User size={11} />
            {claim.reporter_first_name} {claim.reporter_last_name}
          </span>
          {claim.reviewed_at && claim.status !== "pending" && (
            <span className="claim-meta-item">
              <Calendar size={11} />
              Reviewed {timeAgo(claim.reviewed_at)}
            </span>
          )}
        </div>

        {claim.message && (
          <div className="claim-card-message">
            <MessageSquare size={13} className="claim-message-icon" />
            <p>{claim.message}</p>
          </div>
        )}

        <button
          className="claim-view-btn"
          onClick={() => navigate(`/browse-items?item=${claim.item_id}`)}
        >
          <ExternalLink size={11} />
          View Item
        </button>
      </div>
    </div>
  );
};

const MyClaims = () => {
  const { isOpen: sidebarOpen } = useSidebar();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchMyClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/claims/mine`, {
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
  }, []);

  useEffect(() => {
    fetchMyClaims();
  }, [fetchMyClaims]);

  const counts = {
    All: claims.length,
    Pending: claims.filter((c) => c.status === "pending").length,
    Returned: claims.filter((c) => c.status === "approved").length,
    Rejected: claims.filter((c) => c.status === "rejected").length,
  };

  const filtered = claims
    .filter((c) => {
      if (activeFilter === "All") return true;
      const statusMap = { returned: "approved" };
      const statusKey =
        statusMap[activeFilter.toLowerCase()] ?? activeFilter.toLowerCase();
      return c.status === statusKey;
    })
    .map((c, i) => ({ ...c, _index: i }));

  return (
    <div
      className={`myclaims-wrapper ${sidebarOpen ? "myclaims-wrapper--sidebar-open" : "myclaims-wrapper--sidebar-closed"}`}
    >
      <div className="myclaims-container">
        {/* Header */}
        <div className="myclaims-header">
          <div className="myclaims-header-left">
            <div className="myclaims-header-icon">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h1 className="myclaims-page-title">My Claims</h1>
              <p className="myclaims-page-sub">
                {loading ? (
                  <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
                    <Skeleton width={120} height={13} />
                  </SkeletonTheme>
                ) : (
                  `${claims.length} claim${claims.length !== 1 ? "s" : ""} submitted`
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div className="myclaims-filters">
          <Filter size={13} className="myclaims-filter-icon" />
          <div className="myclaims-filter-scroll">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`myclaims-filter-pill ${activeFilter === f ? "myclaims-filter-pill--active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
                {counts[f] > 0 && (
                  <span className="myclaims-pill-count">{counts[f]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
            <div className="myclaims-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <ClaimCardSkeleton key={i} />
              ))}
            </div>
          </SkeletonTheme>
        ) : error ? (
          <div className="myclaims-error">
            <XCircle size={38} />
            <p>{error}</p>
            <button className="myclaims-retry-btn" onClick={fetchMyClaims}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="myclaims-empty">
            <PackageSearch size={38} />
            <p>
              {activeFilter === "All"
                ? "You haven't submitted any claims yet"
                : `No ${activeFilter.toLowerCase()} claims`}
            </p>
            <span>
              {activeFilter === "All"
                ? "Browse items and submit a claim when you find something that belongs to you"
                : "Try switching to a different filter"}
            </span>
          </div>
        ) : (
          <div className="myclaims-list">
            {filtered.map((claim) => (
              <ClaimCard key={claim.id} claim={claim} index={claim._index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClaims;
