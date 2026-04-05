import {
  PackagePlus,
  PackageSearch,
  CheckCircle2,
  Tag,
  MessageSquare,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./RecentActivity.css";

const ACTIVITY_CONFIG = {
  reported_lost: {
    icon: PackagePlus,
    color: "act--orange",
    verb: "Reported lost",
  },
  reported_found: {
    icon: PackageSearch,
    color: "act--blue",
    verb: "Reported found",
  },
  resolved: {
    icon: CheckCircle2,
    color: "act--green",
    verb: "Resolved",
  },
  claimed: {
    icon: Tag,
    color: "act--purple",
    verb: "Claimed",
  },
  message: {
    icon: MessageSquare,
    color: "act--teal",
    verb: "Message received",
  },
};

const MOCK_ACTIVITY = [
  {
    id: 1,
    type: "reported_lost",
    item: "Black Leather Wallet",
    time: "2 minutes ago",
    ref: "LF-2026-0042",
  },
  {
    id: 2,
    type: "resolved",
    item: "AirPods Pro Case",
    time: "1 hour ago",
    ref: "LF-2026-0038",
  },
  {
    id: 3,
    type: "reported_found",
    item: "Blue Umbrella",
    time: "3 hours ago",
    ref: "LF-2026-0041",
  },
  {
    id: 4,
    type: "message",
    item: "Samsung Galaxy Watch",
    time: "Yesterday, 4:00 PM",
    ref: "LF-2026-0035",
  },
  {
    id: 5,
    type: "claimed",
    item: "Scientific Calculator",
    time: "2 days ago",
    ref: "LF-2026-0030",
  },
];

const RecentActivity = () => {
  const navigate = useNavigate();

  return (
    <div className="ra-card">
      <div className="ra-header">
        <div className="ra-header-left">
          <div className="ra-header-icon">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="ra-title">Recent Activity</h2>
            <p className="ra-sub">Your latest actions and updates</p>
          </div>
        </div>
        <button className="ra-view-all" onClick={() => navigate("/my-reports")}>
          View all <ArrowRight size={13} />
        </button>
      </div>

      <div className="ra-list">
        {MOCK_ACTIVITY.map((act, i) => {
          const config = ACTIVITY_CONFIG[act.type];
          const Icon = config.icon;
          return (
            <div
              className="ra-item"
              key={act.id}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="ra-timeline">
                <div className={`ra-dot ${config.color}`}>
                  <Icon size={12} />
                </div>
                {i < MOCK_ACTIVITY.length - 1 && <div className="ra-line" />}
              </div>

              <div className="ra-content">
                <p className="ra-item-title">
                  <span className="ra-verb">{config.verb}:</span> {act.item}
                </p>
                <div className="ra-item-meta">
                  <span className="ra-ref">{act.ref}</span>
                  <span className="ra-time">{act.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
