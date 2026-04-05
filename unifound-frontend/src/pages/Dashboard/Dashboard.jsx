import { useSidebar } from "../../providers/SidebarProvider";
import WelcomeBanner from "../../components/WelcomeBanner/WelcomeBanner";
import OverviewStats from "../../components/OverviewStats/OverviewStats";
import RecentActivity from "../../components/RecentActivity/RecentActivity";
import MyActiveReports from "../../components/MyActiveReports/MyActiveReports";
import NotificationsPreview from "../../components/NotificationsPreview/NotificationsPreview";
import "./Dashboard.css";

const Dashboard = () => {
  const { isOpen: sidebarOpen } = useSidebar();

  return (
    <div
      className={`dashboard-wrapper ${
        sidebarOpen
          ? "dashboard-wrapper--sidebar-open"
          : "dashboard-wrapper--sidebar-closed"
      }`}
    >
      <div className="dashboard-container">
        <WelcomeBanner userName="Bryan" activeReports={2} newMatches={1} />

        <OverviewStats />

        <div className="dashboard-row">
          <div className="dashboard-col--wide">
            <RecentActivity />
          </div>
          <div className="dashboard-col--narrow">
            <NotificationsPreview />
          </div>
        </div>

        <MyActiveReports />
      </div>
    </div>
  );
};

export default Dashboard;
