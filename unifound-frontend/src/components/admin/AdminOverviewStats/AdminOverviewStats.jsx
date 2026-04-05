import {
  PackageSearch,
  PackagePlus,
  CheckCircle2,
  Clock,
  Users,
  AlertTriangle,
} from "lucide-react";
import "./AdminOverviewStats.css";

const STATS = [
  {
    label: "Active Cases",
    value: 47,
    icon: PackageSearch,
    color: "aos--blue",
    change: "+5 today",
    positive: false,
  },
  {
    label: "Lost Reports",
    value: 28,
    icon: PackagePlus,
    color: "aos--orange",
    change: "+2 today",
    positive: false,
  },
  {
    label: "Found Reports",
    value: 19,
    icon: PackageSearch,
    color: "aos--green",
    change: "+3 today",
    positive: true,
  },
  {
    label: "Pending Claims",
    value: 12,
    icon: Clock,
    color: "aos--yellow",
    change: "Needs review",
    positive: false,
  },
  {
    label: "Resolved Cases",
    value: 87,
    icon: CheckCircle2,
    color: "aos--teal",
    change: "All time",
    positive: true,
  },
  {
    label: "Total Users",
    value: 248,
    icon: Users,
    color: "aos--purple",
    change: "+12 this week",
    positive: true,
  },
];

const AdminOverviewStats = () => (
  <div className="aos-grid">
    {STATS.map((stat, i) => {
      const Icon = stat.icon;
      return (
        <div
          className={`aos-card ${stat.color}`}
          key={stat.label}
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          <div className="aos-card-top">
            <div className="aos-icon-wrap">
              <Icon size={17} />
            </div>
            <span
              className={`aos-change ${stat.positive ? "aos-change--pos" : "aos-change--neg"}`}
            >
              {stat.change}
            </span>
          </div>
          <p className="aos-value">{stat.value}</p>
          <p className="aos-label">{stat.label}</p>
        </div>
      );
    })}
  </div>
);

export default AdminOverviewStats;
