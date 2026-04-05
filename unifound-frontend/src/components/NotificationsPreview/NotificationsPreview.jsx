import {
  Bell,
  PackageSearch,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  BellOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NotificationsPreview.css";

const NOTIF_CONFIG = {
  match: {
    icon: PackageSearch,
    color: "np--blue",
  },
  claimed: {
    icon: CheckCircle2,
    color: "np--green",
  },
  alert: {
    icon: AlertCircle,
    color: "np--orange",
  },
  message: {
    icon: MessageSquare,
    color: "np--purple",
  },
};

const MOCK_NOTIFS = [
  {
    id: 1,
    type: "match",
    title: "Possible match for your lost wallet",
    time: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "claimed",
    title: "Your found item has been claimed",
    time: "1 hr ago",
    read: false,
  },
  {
    id: 3,
    type: "message",
    title: "New message from Lost & Found Office",
    time: "3 hrs ago",
    read: false,
  },
  {
    id: 4,
    type: "alert",
    title: "Item unclaimed after 7 days",
    time: "Yesterday",
    read: true,
  },
];

const NotificationsPreview = () => {
  const navigate = useNavigate();
  const unread = MOCK_NOTIFS.filter((n) => !n.read).length;

  return (
    <div className="np-card">
      <div className="np-header">
        <div className="np-header-left">
          <div className="np-header-icon">
            <Bell size={16} />
            {unread > 0 && <span className="np-badge">{unread}</span>}
          </div>
          <div>
            <h2 className="np-title">Notifications</h2>
            <p className="np-sub">
              {unread > 0 ? `${unread} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <button
          className="np-view-all"
          onClick={() => navigate("/notifications")}
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      <div className="np-list">
        {MOCK_NOTIFS.length === 0 ? (
          <div className="np-empty">
            <BellOff size={28} />
            <p>No notifications</p>
          </div>
        ) : (
          MOCK_NOTIFS.map((notif, i) => {
            const config = NOTIF_CONFIG[notif.type];
            const Icon = config.icon;
            return (
              <div
                className={`np-item ${notif.read ? "np-item--read" : "np-item--unread"}`}
                key={notif.id}
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => navigate("/notifications")}
              >
                {!notif.read && <span className="np-pip" />}
                <div className={`np-icon-wrap ${config.color}`}>
                  <Icon size={14} />
                </div>
                <div className="np-content">
                  <p className="np-item-title">{notif.title}</p>
                  <span className="np-time">{notif.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPreview;
