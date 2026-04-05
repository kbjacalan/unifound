import { Activity, ArrowRight, MapPin, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./RecentReportsFeed.css";

const STATUS_CONFIG = {
  lost: { label: "Lost", className: "rrf-status--lost" },
  found: { label: "Found", className: "rrf-status--found" },
  claimed: { label: "Claimed", className: "rrf-status--claimed" },
  resolved: { label: "Resolved", className: "rrf-status--resolved" },
};

const MOCK_REPORTS = [
  {
    id: 1,
    name: "Black Leather Wallet",
    category: "Bags & Wallets",
    location: "Library 2F",
    reporter: "Bryan J.",
    date: "Mar 29",
    status: "lost",
  },
  {
    id: 2,
    name: "Blue Umbrella",
    category: "Other",
    location: "Cafeteria",
    reporter: "Ana M.",
    date: "Mar 28",
    status: "found",
  },
  {
    id: 3,
    name: "AirPods Pro Case",
    category: "Electronics",
    location: "Gym",
    reporter: "Carlo R.",
    date: "Mar 27",
    status: "resolved",
  },
  {
    id: 4,
    name: "Samsung Galaxy Watch",
    category: "Electronics",
    location: "Eng. Building",
    reporter: "Lea T.",
    date: "Mar 27",
    status: "found",
  },
  {
    id: 5,
    name: "Scientific Calculator",
    category: "Books & Stationery",
    location: "Room 204",
    reporter: "Mark D.",
    date: "Mar 26",
    status: "claimed",
  },
];

const RecentReportsFeed = () => {
  const navigate = useNavigate();

  return (
    <div className="rrf-card">
      <div className="rrf-header">
        <div className="rrf-header-left">
          <div className="rrf-header-icon">
            <Activity size={16} />
          </div>
          <div>
            <h2 className="rrf-title">Recent Reports</h2>
            <p className="rrf-sub">Latest submissions across all users</p>
          </div>
        </div>
        <button
          className="rrf-view-all"
          onClick={() => navigate("/admin/manage-items")}
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      <div className="rrf-list">
        {MOCK_REPORTS.map((report, i) => {
          const status = STATUS_CONFIG[report.status];
          return (
            <div
              className="rrf-item"
              key={report.id}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="rrf-item-main">
                <div className="rrf-item-top">
                  <p className="rrf-item-name">{report.name}</p>
                  <span className={`rrf-status-badge ${status.className}`}>
                    <span className="rrf-status-dot" />
                    {status.label}
                  </span>
                </div>
                <div className="rrf-item-meta">
                  <span className="rrf-meta-row">
                    <User size={11} />
                    {report.reporter}
                  </span>
                  <span className="rrf-meta-row">
                    <MapPin size={11} />
                    {report.location}
                  </span>
                  <span className="rrf-meta-row">
                    <Calendar size={11} />
                    {report.date}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentReportsFeed;
