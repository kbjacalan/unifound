import { useState } from "react";
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
} from "lucide-react";
import { useSidebar } from "../../providers/SidebarProvider";
import "./Notifications.css";

const NOTIF_TYPES = {
  match: {
    icon: PackageSearch,
    color: "notif--match",
    label: "Match Found",
  },
  claimed: {
    icon: CheckCircle2,
    color: "notif--claimed",
    label: "Item Claimed",
  },
  alert: {
    icon: AlertCircle,
    color: "notif--alert",
    label: "Alert",
  },
  message: {
    icon: MessageSquare,
    color: "notif--message",
    label: "Message",
  },
  status: {
    icon: Tag,
    color: "notif--status",
    label: "Status Update",
  },
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "match",
    title: "Possible match for your lost item",
    body: "A black leather wallet was found near the Library 2nd Floor — it may match your report LF-2026-0042.",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: 2,
    type: "claimed",
    title: "Your found item has been claimed",
    body: "The blue umbrella you reported found at the Cafeteria has been successfully claimed by its owner.",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    type: "message",
    title: "New message from Lost & Found Office",
    body: "Please visit the Lost & Found office at Room 101 to verify ownership of the item you reported.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 4,
    type: "status",
    title: "Report status updated to Resolved",
    body: "Your report for 'AirPods Pro Case' (LF-2026-0038) has been marked as resolved.",
    time: "Yesterday, 4:30 PM",
    read: true,
  },
  {
    id: 5,
    type: "alert",
    title: "Item unclaimed after 7 days",
    body: "The Samsung Galaxy Watch you reported found is still unclaimed. It will be turned over to the admin office in 3 days.",
    time: "Yesterday, 10:00 AM",
    read: true,
  },
  {
    id: 6,
    type: "match",
    title: "Possible match for your lost item",
    body: "A set of keys with a red lanyard was found at the Engineering Building lobby — similar to your report.",
    time: "2 days ago",
    read: true,
  },
  {
    id: 7,
    type: "status",
    title: "Report submitted successfully",
    body: "Your lost item report for 'Scientific Calculator' has been received and is now visible to other users.",
    time: "3 days ago",
    read: true,
  },
];

const FILTERS = [
  "All",
  "Unread",
  "Match Found",
  "Status Update",
  "Message",
  "Alert",
];

const NotificationItem = ({ notif, onRead, onDelete }) => {
  const config = NOTIF_TYPES[notif.type];
  const Icon = config.icon;

  return (
    <div
      className={`notif-item ${config.color} ${notif.read ? "notif-item--read" : "notif-item--unread"}`}
      style={{ animationDelay: `${notif._index * 0.05}s` }}
    >
      {!notif.read && <span className="notif-unread-pip" />}

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
            {notif.time}
          </span>
        </div>
        <p className="notif-title">{notif.title}</p>
        <p className="notif-body">{notif.body}</p>
      </div>

      <div className="notif-actions">
        {!notif.read && (
          <button
            className="notif-action-btn notif-action-btn--read"
            onClick={() => onRead(notif.id)}
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Check size={13} />
          </button>
        )}
        <button
          className="notif-action-btn notif-action-btn--delete"
          onClick={() => onDelete(notif.id)}
          aria-label="Delete"
          title="Delete notification"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { isOpen: sidebarOpen } = useSidebar();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState("All");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const deleteNotif = (id) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAll = () => setNotifications([]);

  const filtered = notifications
    .filter((n) => {
      if (activeFilter === "All") return true;
      if (activeFilter === "Unread") return !n.read;
      return NOTIF_TYPES[n.type]?.label === activeFilter;
    })
    .map((n, i) => ({ ...n, _index: i }));

  return (
    <div
      className={`notif-wrapper ${
        sidebarOpen
          ? "notif-wrapper--sidebar-open"
          : "notif-wrapper--sidebar-closed"
      }`}
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
                {unreadCount > 0
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

        {filtered.length === 0 ? (
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
