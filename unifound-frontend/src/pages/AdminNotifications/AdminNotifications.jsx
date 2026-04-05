import { useState } from "react";
import { useSidebar } from "../../providers/SidebarProvider";
import {
  Bell,
  AlertTriangle,
  PackageSearch,
  Users,
  Clock,
  Check,
  Trash2,
  BellOff,
  Filter,
  X,
} from "lucide-react";
import "./AdminNotifications.css";

const NOTIF_TYPES = {
  unclaimed: {
    icon: AlertTriangle,
    color: "amn-notif--orange",
    label: "Unclaimed",
  },
  match: { icon: PackageSearch, color: "amn-notif--blue", label: "Match" },
  user: { icon: Users, color: "amn-notif--purple", label: "User" },
  system: { icon: Bell, color: "amn-notif--teal", label: "System" },
};

const MOCK_NOTIFS = [
  {
    id: 1,
    type: "unclaimed",
    title: "Red Lanyard Keys nearing turnover",
    body: "Item LF-2026-0033 has 1 day left before it must be turned over to admin.",
    time: "10 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "unclaimed",
    title: "Samsung Galaxy Watch unclaimed",
    body: "Item LF-2026-0035 has 3 days left. Consider reaching out to the reporter.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "user",
    title: "New user registered",
    body: "Mark Dela Cruz just created amn account and submitted their first report.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "match",
    title: "Possible match detected",
    body: "System detected a potential match between LF-2026-0042 and LF-2026-0040.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 5,
    type: "system",
    title: "Weekly summary ready",
    body: "The weekly system report for March 22–28 is available for review.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 6,
    type: "unclaimed",
    title: "Eyeglasses Case — 5 days left",
    body: "Item LF-2026-0029 at the Canteen is approaching the turnover deadline.",
    time: "Yesterday",
    read: true,
  },
  {
    id: 7,
    type: "user",
    title: "User account flagged",
    body: "Multiple failed login attempts detected for user ana@school.edu.",
    time: "2 days ago",
    read: true,
  },
];

const FILTERS = ["All", "Unread", "Unclaimed", "Match", "User", "System"];

const AdminNotifications = () => {
  const { isOpen: sidebarOpen } = useSidebar();
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead = (id) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const deleteNotif = (id) =>
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifs([]);

  const filtered = notifs
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return !n.read;
      return NOTIF_TYPES[n.type]?.label === activeFilter;
    })
    .map((n, i) => ({ ...n, _index: i }));

  return (
    <div
      className={`amn-wrapper ${sidebarOpen ? "amn-wrapper--sidebar-open" : "amn-wrapper--sidebar-closed"}`}
    >
      <div className="amn-container">
        <div className="amn-header">
          <div className="amn-header-left">
            <div className="amn-header-icon">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="amn-header-badge">{unreadCount}</span>
              )}
            </div>
            <div>
              <h1 className="amn-page-title">Admin Notifications</h1>
              <p className="amn-page-sub">
                {unreadCount > 0
                  ? `${unreadCount} unread alerts`
                  : "All caught up"}
              </p>
            </div>
          </div>
          {notifs.length > 0 && (
            <div className="amn-header-actions">
              {unreadCount > 0 && (
                <button className="amn-ctrl-btn" onClick={markAllRead}>
                  <Check size={13} /> Mark all read
                </button>
              )}
              <button
                className="amn-ctrl-btn amn-ctrl-btn--danger"
                onClick={clearAll}
              >
                <Trash2 size={13} /> Clear all
              </button>
            </div>
          )}
        </div>

        <div className="amn-filters">
          <Filter size={13} className="amn-filter-icon" />
          <div className="amn-filter-scroll">
            {FILTERS.map((f) => (
              <button
                key={f}
                className={`amn-filter-pill ${activeFilter === f ? "amn-filter-pill--active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
                {f === "Unread" && unreadCount > 0 && (
                  <span className="amn-pill-count">{unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="amn-empty">
            <BellOff size={38} />
            <p>No notifications</p>
            <span>
              {activeFilter !== "All"
                ? "Try switching to a different filter"
                : "You're all caught up"}
            </span>
          </div>
        ) : (
          <div className="amn-list">
            {filtered.map((notif) => {
              const config = NOTIF_TYPES[notif.type];
              const Icon = config.icon;
              return (
                <div
                  key={notif.id}
                  className={`amn-item ${config.color} ${notif.read ? "amn-item--read" : "amn-item--unread"}`}
                  style={{ animationDelay: `${notif._index * 0.05}s` }}
                >
                  {!notif.read && <span className="amn-pip" />}
                  <div className={`amn-icon-wrap ${config.color}-icon`}>
                    <Icon size={16} />
                  </div>
                  <div className="amn-content">
                    <div className="amn-top">
                      <span className={`amn-type-badge ${config.color}-badge`}>
                        {config.label}
                      </span>
                      <span className="amn-time">
                        <Clock size={11} />
                        {notif.time}
                      </span>
                    </div>
                    <p className="amn-title">{notif.title}</p>
                    <p className="amn-body">{notif.body}</p>
                  </div>
                  <div className="amn-actions">
                    {!notif.read && (
                      <button
                        className="amn-action-btn amn-action-btn--read"
                        onClick={() => markRead(notif.id)}
                        title="Mark as read"
                      >
                        <Check size={13} />
                      </button>
                    )}
                    <button
                      className="amn-action-btn amn-action-btn--delete"
                      onClick={() => deleteNotif(notif.id)}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
