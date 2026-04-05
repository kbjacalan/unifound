import {
  PackageSearch,
  PackagePlus,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import "./OverviewStats.css";

const STATS = [
  {
    label: "Total Reports",
    value: 24,
    icon: ClipboardList,
    color: "stat--blue",
    change: "+3 this week",
    positive: true,
  },
  {
    label: "Items Lost",
    value: 10,
    icon: PackagePlus,
    color: "stat--orange",
    change: "+1 today",
    positive: false,
  },
  {
    label: "Items Found",
    value: 9,
    icon: PackageSearch,
    color: "stat--green",
    change: "+2 this week",
    positive: true,
  },
  {
    label: "Resolved",
    value: 5,
    icon: CheckCircle2,
    color: "stat--purple",
    change: "All time",
    positive: true,
  },
];

const OverviewStats = () => {
  return (
    <div className="os-grid">
      {STATS.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            className={`os-card ${stat.color}`}
            key={stat.label}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="os-card-top">
              <div className="os-icon-wrap">
                <Icon size={18} />
              </div>
              <span
                className={`os-change ${stat.positive ? "os-change--pos" : "os-change--neg"}`}
              >
                {stat.change}
              </span>
            </div>
            <p className="os-value">{stat.value}</p>
            <p className="os-label">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default OverviewStats;
