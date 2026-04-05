import { Users, ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./UserActivitySummary.css";

const TOP_USERS = [
  { name: "Bryan Jacalan", role: "Student", reports: 8, avatar: "BJ" },
  { name: "Ana Mendoza", role: "Student", reports: 6, avatar: "AM" },
  { name: "Carlo Reyes", role: "Staff", reports: 5, avatar: "CR" },
  { name: "Lea Torres", role: "Student", reports: 4, avatar: "LT" },
  { name: "Mark Dela Cruz", role: "Student", reports: 3, avatar: "MD" },
];

const ROLE_COLORS = {
  Student: "uas-role--student",
  Staff: "uas-role--staff",
  Admin: "uas-role--admin",
};

const UserActivitySummary = () => {
  const navigate = useNavigate();

  return (
    <div className="uas-card">
      <div className="uas-header">
        <div className="uas-header-left">
          <div className="uas-header-icon">
            <Users size={16} />
          </div>
          <div>
            <h2 className="uas-title">User Activity</h2>
            <p className="uas-sub">Top reporters this month</p>
          </div>
        </div>
        <button
          className="uas-view-all"
          onClick={() => navigate("/admin/manage-users")}
        >
          All users <ArrowRight size={13} />
        </button>
      </div>

      <div className="uas-list">
        {TOP_USERS.map((user, i) => (
          <div
            className="uas-item"
            key={user.name}
            style={{ animationDelay: `${i * 0.07}s` }}
          >
            <span className="uas-rank">#{i + 1}</span>
            <div className="uas-avatar">{user.avatar}</div>
            <div className="uas-info">
              <p className="uas-name">{user.name}</p>
              <span className={`uas-role ${ROLE_COLORS[user.role]}`}>
                {user.role}
              </span>
            </div>
            <div className="uas-reports">
              <TrendingUp size={12} />
              <span>{user.reports}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserActivitySummary;
