import { useSidebar } from "../../providers/SidebarProvider";
import SystemStatsBanner from "../../components/admin/SystemStatsBanner/SystemStatsBanner";
import AdminOverviewStats from "../../components/admin/AdminOverviewStats/AdminOverviewStats";
import RecentReportsFeed from "../../components/admin/RecentReportsFeed/RecentReportsFeed";
import UnclaimedItemsAlert from "../../components/admin/UnclaimedItemsAlert/UnclaimedItemsAlert";
import UserActivitySummary from "../../components/admin/UserActivitySummary/UserActivitySummary";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <div
      className={`admin-dashboard-wrapper ${
        sidebarOpen
          ? "admin-dashboard-wrapper--sidebar-open"
          : "admin-dashboard-wrapper--sidebar-closed"
      }`}
    >
      <div className="admin-dashboard-container">
        <SystemStatsBanner />
        <AdminOverviewStats />
        <UnclaimedItemsAlert />
        <div className="admin-dashboard-row">
          <div className="admin-dashboard-col--wide">
            <RecentReportsFeed />
          </div>
          <div className="admin-dashboard-col--narrow">
            <UserActivitySummary />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
