import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  PackageSearch,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Tag,
  Clock,
  Check,
  Trash2,
  BellOff,
  Filter,
  ExternalLink,
} from "lucide-react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSidebar } from "../../providers/SidebarProvider";
import { useNotifications } from "../../providers/NotificationsProvider";
import "./Notifications.css";

const API_URL = import.meta.env.VITE_UNIFOUND_BACKEND_URL;

const NOTIF_TYPES = {
  match: { icon: PackageSearch, color: "notif--match", label: "Match Found" },
  claimed: {
    icon: CheckCircle2,
    color: "notif--claimed",
    label: "Item Claimed",
  },
  alert: { icon: AlertCircle, color: "notif--alert", label: "Alert" },
  message: { icon: MessageSquare, color: "notif--message", label: "Message" },
  status: { icon: Tag, color: "notif--status", label: "Status Update" },
};

const FILTERS = ["All", "Unread", "Item Claimed", "Message", "Alert"];

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
  });
};

/* ── Skeleton for a single notification row ── */
const NotifItemSkeleton = () => (
  <div
    className="notif-item notif-item--read"
    style={{ pointerEvents: "none" }}
  >
    {/* Left unread pip — 4px wide, 48px tall */}
    <span className="notif-unread-pip" style={{ background: "#e2e8f0" }} />

    {/* Icon wrap — 38×38, border-radius 10px */}
    <Skeleton
      width={38}
      height={38}
      style={{ borderRadius: 10, flexShrink: 0 }}
    />

    {/* Content */}
    <div className="notif-content">
      {/* Top row: type badge + time */}
      <div className="notif-top">
        <Skeleton width={80} height={20} style={{ borderRadius: 20 }} />
        <Skeleton width={44} height={11} style={{ marginLeft: "auto" }} />
      </div>

      {/* Notification title — 13.5px bold */}
      <Skeleton width="65%" height={14} style={{ marginTop: 2 }} />

      {/* Body text — 12.5px, two lines */}
      <Skeleton width="90%" height={12} style={{ marginTop: 2 }} />
      <Skeleton width="70%" height={12} style={{ marginTop: 3 }} />

      {/* View Item link */}
      <Skeleton
        width={64}
        height={12}
        style={{ marginTop: 6, borderRadius: 4 }}
      />
    </div>

    {/* Action buttons column — two 28×28 squares */}
    <div className="notif-actions">
      <Skeleton width={28} height={28} style={{ borderRadius: 8 }} />
      <Skeleton width={28} height={28} style={{ borderRadius: 8 }} />
    </div>
  </div>
);

const NotificationItem = ({ notif, onRead, onDelete, onNavigate }) => {
  const config = NOTIF_TYPES[notif.type] ?? NOTIF_TYPES.status;
  const Icon = config.icon;

  const handleViewItem = async (e) => {
    e.preventDefault();
    if (!notif.is_read) await onRead(notif.id);
    if (notif.type === "message") {
      onNavigate(`/my-reports?item=${notif.item_id}`);
    } else {
      onNavigate("/my-claims");
    }
  };

  return (
    <div
      className={`notif-item ${config.color} ${notif.is_read ? "notif-item--read" : "notif-item--unread"}`}
      style={{ animationDelay: `${notif._index * 0.05}s` }}
    >
      {!notif.is_read && <span className="notif-unread-pip" />}
      <div className={`notif-icon-wrap ${config.color}-icon`}>
        <Icon size={16} />
      </div>
      <div className="notif-content">
        <div className="notif-top">
          <span className={`notif-type-badge ${config.color}-badge`}>
            {config.label}
          </span>
          <span className="notif-time">
            <Clock size={11} />
            {timeAgo(notif.created_at)}
          </span>
        </div>
        <p className="notif-title">{notif.title}</p>
        {notif.body && <p className="notif-body">{notif.body}</p>}
        {notif.item_id && (
          <button className="notif-view-item" onClick={handleViewItem}>
            <ExternalLink size={11} />
            {notif.type === "claimed" || notif.type === "alert"
              ? "View Claim"
              : "View Item"}
          </button>
        )}
      </div>
      <div className="notif-actions">
        {!notif.is_read && (
          <button
            className="notif-action-btn notif-action-btn--read"
            onClick={() => onRead(notif.id)}
            title="Mark as read"
          >
            <Check size={13} />
          </button>
        )}
        <button
          className="notif-action-btn notif-action-btn--delete"
          onClick={() => onDelete(notif.id)}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { isOpen: sidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { decrementUnread, resetUnread, newNotifListenerRef } =
    useNotifications();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setNotifications(data.data?.notifications ?? []);
    } catch {
      /* silently fail */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    newNotifListenerRef.current = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
    };
    return () => {
      newNotifListenerRef.current = null;
    };
  }, [newNotifListenerRef]);

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    decrementUnread(1);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const deleteNotif = async (id) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.is_read) decrementUnread(1);
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    resetUnread();
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const clearAll = async () => {
    const toDelete = [...notifications];
    setNotifications([]);
    resetUnread();
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        toDelete.map((n) =>
          fetch(`${API_URL}/api/notifications/${n.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
    } catch {
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const filtered = notifications
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return !n.is_read;
      return NOTIF_TYPES[n.type]?.label === activeFilter;
    })
    .map((n, i) => ({ ...n, _index: i }));

  return (
    <div
      className={`notif-wrapper ${sidebarOpen ? "notif-wrapper--sidebar-open" : "notif-wrapper--sidebar-closed"}`}
    >
      <div className="notif-container">
        <div className="notif-header">
          <div className="notif-header-left">
            <div className="notif-header-icon">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="notif-header-badge">{unreadCount}</span>
              )}
            </div>
            <div>
              <h1 className="notif-page-title">Notifications</h1>
              <p className="notif-page-sub">
                {loading
                  ? "Loading…"
                  : unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                    : "You're all caught up"}
              </p>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button className="notif-ctrl-btn" onClick={markAllRead}>
                  <Check size={13} />
                  Mark all read
                </button>
              )}
              <button
                className="notif-ctrl-btn notif-ctrl-btn--danger"
                onClick={clearAll}
              >
                <Trash2 size={13} />
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="notif-filters">
          <Filter size={13} className="notif-filter-icon" />
          <div className="notif-filter-scroll">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`notif-filter-pill ${activeFilter === f ? "notif-filter-pill--active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
                {f === "Unread" && unreadCount > 0 && (
                  <span className="notif-pill-count">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f1f5f9">
            <div className="notif-list">
              {Array.from({ length: 5 }).map((_, i) => (
                <NotifItemSkeleton key={i} />
              ))}
            </div>
          </SkeletonTheme>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <BellOff size={38} />
            <p>No notifications here</p>
            <span>
              {activeFilter !== "All"
                ? "Try switching to a different filter"
                : "You're all caught up — check back later"}
            </span>
          </div>
        ) : (
          <div className="notif-list">
            {filtered.map((notif) => (
              <NotificationItem
                key={notif.id}
                notif={notif}
                onRead={markRead}
                onDelete={deleteNotif}
                onNavigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
