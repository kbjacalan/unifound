import { ShieldCheck, Users, PackageSearch, TrendingUp } from "lucide-react";
import "./SystemStatsBanner.css";

const SystemStatsBanner = ({
  totalUsers = 248,
  totalReports = 134,
  resolutionRate = 76,
}) => {
  return (
    <div className="ssb-banner">
      <div className="ssb-glow" />

      <div className="ssb-content">
        <div className="ssb-text">
          <div className="ssb-admin-pill">
            <ShieldCheck size={11} /> Admin Mode
          </div>
          <h1 className="ssb-title">System Overview</h1>
          <p className="ssb-sub">
            UniFound is running smoothly. Resolution rate is at{" "}
            <strong>{resolutionRate}%</strong> this month.
          </p>
        </div>

        <div className="ssb-quick-stats">
          <div className="ssb-stat">
            <Users size={16} />
            <div>
              <span className="ssb-stat-value">{totalUsers}</span>
              <span className="ssb-stat-label">Total Users</span>
            </div>
          </div>
          <div className="ssb-stat-divider" />
          <div className="ssb-stat">
            <PackageSearch size={16} />
            <div>
              <span className="ssb-stat-value">{totalReports}</span>
              <span className="ssb-stat-label">Total Reports</span>
            </div>
          </div>
          <div className="ssb-stat-divider" />
          <div className="ssb-stat">
            <TrendingUp size={16} />
            <div>
              <span className="ssb-stat-value">{resolutionRate}%</span>
              <span className="ssb-stat-label">Resolution Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ssb-illustration">
        <div className="ssb-circle ssb-circle--lg" />
        <div className="ssb-circle ssb-circle--md" />
        <div className="ssb-circle ssb-circle--sm" />
        <ShieldCheck className="ssb-icon" size={64} />
      </div>
    </div>
  );
};

export default SystemStatsBanner;
