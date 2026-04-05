import { useSidebar } from "../../providers/SidebarProvider";
import { BarChart2, TrendingUp, PieChart, Calendar } from "lucide-react";
import "./Analytics.css";

const CATEGORY_DATA = [
  { label: "Electronics", count: 32, pct: 75 },
  { label: "Bags & Wallets", count: 24, pct: 56 },
  { label: "Books & Stationery", count: 18, pct: 42 },
  { label: "Keys", count: 14, pct: 33 },
  { label: "ID & Cards", count: 12, pct: 28 },
  { label: "Clothing", count: 10, pct: 23 },
  { label: "Jewelry", count: 8, pct: 19 },
  { label: "Other", count: 16, pct: 37 },
];

const MONTHLY_DATA = [
  { month: "Oct", lost: 8, found: 5 },
  { month: "Nov", lost: 12, found: 9 },
  { month: "Dec", lost: 6, found: 4 },
  { month: "Jan", lost: 14, found: 11 },
  { month: "Feb", lost: 10, found: 8 },
  { month: "Mar", lost: 18, found: 13 },
];

const MAX_MONTHLY = 20;

const STATUS_DIST = [
  { label: "Lost", count: 28, color: "#f97316", pct: 35 },
  { label: "Found", count: 19, color: "#22c55e", pct: 24 },
  { label: "Claimed", count: 12, color: "#a855f7", pct: 15 },
  { label: "Resolved", count: 21, color: "#2563eb", pct: 26 },
];

const Analytics = () => {
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <div
      className={`an-wrapper ${sidebarOpen ? "an-wrapper--sidebar-open" : "an-wrapper--sidebar-closed"}`}
    >
      <div className="an-container">
        <div className="an-header">
          <div className="an-header-icon">
            <BarChart2 size={20} />
          </div>
          <div>
            <h1 className="an-page-title">Analytics</h1>
            <p className="an-page-sub">System-wide insights and trends</p>
          </div>
        </div>

        <div className="an-grid">
          {/* Monthly Trend */}
          <div className="an-card an-card--wide">
            <div className="an-card-header">
              <TrendingUp size={15} />
              <h2 className="an-card-title">Monthly Reports Trend</h2>
              <span className="an-card-period">
                <Calendar size={12} /> Last 6 months
              </span>
            </div>
            <div className="an-bar-chart">
              {MONTHLY_DATA.map((d, i) => (
                <div
                  className="an-bar-group"
                  key={d.month}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="an-bars">
                    <div className="an-bar-wrap">
                      <div
                        className="an-bar an-bar--lost"
                        style={{ height: `${(d.lost / MAX_MONTHLY) * 100}%` }}
                        title={`Lost: ${d.lost}`}
                      />
                    </div>
                    <div className="an-bar-wrap">
                      <div
                        className="an-bar an-bar--found"
                        style={{ height: `${(d.found / MAX_MONTHLY) * 100}%` }}
                        title={`Found: ${d.found}`}
                      />
                    </div>
                  </div>
                  <span className="an-bar-label">{d.month}</span>
                </div>
              ))}
            </div>
            <div className="an-legend">
              <span className="an-legend-item">
                <span className="an-legend-dot an-legend-dot--lost" />
                Lost
              </span>
              <span className="an-legend-item">
                <span className="an-legend-dot an-legend-dot--found" />
                Found
              </span>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="an-card">
            <div className="an-card-header">
              <PieChart size={15} />
              <h2 className="an-card-title">Status Distribution</h2>
            </div>
            <div className="an-dist-list">
              {STATUS_DIST.map((s, i) => (
                <div
                  className="an-dist-item"
                  key={s.label}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="an-dist-top">
                    <span className="an-dist-label">
                      <span
                        className="an-dist-dot"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </span>
                    <span className="an-dist-count">{s.count}</span>
                  </div>
                  <div className="an-dist-bar-wrap">
                    <div
                      className="an-dist-bar"
                      style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="an-card an-card--full">
            <div className="an-card-header">
              <BarChart2 size={15} />
              <h2 className="an-card-title">Reports by Category</h2>
            </div>
            <div className="an-cat-list">
              {CATEGORY_DATA.map((cat, i) => (
                <div
                  className="an-cat-item"
                  key={cat.label}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <span className="an-cat-label">{cat.label}</span>
                  <div className="an-cat-bar-wrap">
                    <div
                      className="an-cat-bar"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                  <span className="an-cat-count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
