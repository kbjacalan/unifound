import {
  ClipboardList,
  MapPin,
  Calendar,
  ArrowRight,
  PackageSearch,
  Tag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./MyActiveReports.css";

const STATUS_CONFIG = {
  lost: { label: "Lost", className: "status--lost" },
  found: { label: "Found", className: "status--found" },
  claimed: { label: "Claimed", className: "status--claimed" },
  resolved: { label: "Resolved", className: "status--resolved" },
};

const MOCK_REPORTS = [
  {
    id: 1,
    name: "Black Leather Wallet",
    category: "Bags & Wallets",
    location: "Library 2nd Floor",
    date: "Mar 29, 2026",
    status: "lost",
    ref: "LF-2026-0042",
  },
  {
    id: 2,
    name: "Blue Umbrella",
    category: "Other",
    location: "Cafeteria",
    date: "Mar 27, 2026",
    status: "found",
    ref: "LF-2026-0041",
  },
  {
    id: 3,
    name: "Scientific Calculator",
    category: "Books & Stationery",
    location: "Room 204",
    date: "Mar 25, 2026",
    status: "claimed",
    ref: "LF-2026-0030",
  },
];

const MyActiveReports = () => {
  const navigate = useNavigate();

  return (
    <div className="mar-card">
      <div className="mar-header">
        <div className="mar-header-left">
          <div className="mar-header-icon">
            <ClipboardList size={16} />
          </div>
          <div>
            <h2 className="mar-title">My Active Reports</h2>
            <p className="mar-sub">{MOCK_REPORTS.length} reports in progress</p>
          </div>
        </div>
        <button
          className="mar-view-all"
          onClick={() => navigate("/my-reports")}
        >
          View all <ArrowRight size={13} />
        </button>
      </div>

      <div className="mar-list">
        {MOCK_REPORTS.map((report, i) => {
          const status = STATUS_CONFIG[report.status];
          return (
            <div
              className="mar-item"
              key={report.id}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => navigate("/my-reports")}
            >
              <div className="mar-item-image-placeholder">
                <PackageSearch size={20} />
              </div>

              <div className="mar-item-info">
                <div className="mar-item-top">
                  <p className="mar-item-name">{report.name}</p>
                  <span className={`mar-status-badge ${status.className}`}>
                    <span className="mar-status-dot" />
                    {status.label}
                  </span>
                </div>

                <div className="mar-item-meta">
                  <span className="mar-meta-row">
                    <Tag size={11} /> {report.category}
                  </span>
                  <span className="mar-meta-row">
                    <MapPin size={11} /> {report.location}
                  </span>
                  <span className="mar-meta-row">
                    <Calendar size={11} /> {report.date}
                  </span>
                </div>
              </div>

              <span className="mar-ref">{report.ref}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyActiveReports;
