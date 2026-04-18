import { useState, useEffect, useCallback } from "react";
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
  Loader,
  ExternalLink,
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import "./Notifications.css";

const API_BASE = "http://localhost:5000";

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

const NotificationItem = ({ notif, onRead, onDelete, onNavigate }) => {
  const config = NOTIF_TYPES[notif.type] ?? NOTIF_TYPES.status;
  const Icon = config.icon;

  const handleViewItem = async (e) => {
    e.preventDefault();
    // Mark as read before navigating
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/notifications`, {
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

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const deleteNotif = async (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/notifications/read-all`, {
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
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        toDelete.map((n) =>
          fetch(`${API_BASE}/api/notifications/${n.id}`, {
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
          <div className="notif-loading">
            <Loader size={28} className="notif-spinner" />
            <p>Loading notifications…</p>
          </div>
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
