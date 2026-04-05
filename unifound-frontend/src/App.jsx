import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layouts
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";
import DashboardLayout from "./layout/DashboardLayout";
import AdminDashboardLayout from "./layout/AdminDashboardLayout";

// Utilities
import ScrollToTop from "./utils/ScrollToTop";

// Public pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";

// User pages
import Dashboard from "./pages/Dashboard/Dashboard";
import Browse from "./pages/Browse/Browse";
import Report from "./pages/Report/Report";
import MyReport from "./pages/MyReport/MyReport";
import Notifications from "./pages/Notifications/Notifications";

// Admin pages
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import ManageItems from "./pages/ManageItems/ManageItems";
import ManageUsers from "./pages/ManageUsers/ManageUsers";
import ResolvedCases from "./pages/ResolvedCases/ResolvedCases";
import Analytics from "./pages/Analytics/Analytics";
import AdminNotifications from "./pages/AdminNotifications/AdminNotifications";

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();
  const userRole = user?.role;

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              isPublic={true}
            >
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              isPublic={true}
            >
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              requiresAdmin={false}
            >
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/browse-items" element={<Browse />} />
          <Route path="/report-item" element={<Report />} />
          <Route path="/my-reports" element={<MyReport />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              userRole={userRole}
              requiresAdmin={true}
            >
              <AdminDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/manage-items" element={<ManageItems />} />
          <Route path="/admin/manage-users" element={<ManageUsers />} />
          <Route path="/admin/resolved-cases" element={<ResolvedCases />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
