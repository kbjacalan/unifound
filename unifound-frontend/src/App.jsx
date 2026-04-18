import { Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./providers/AuthProvider";
import { NotificationsProvider } from "./providers/NotificationsProvider";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layouts
import MainLayout from "./layout/MainLayout";
import AuthLayout from "./layout/AuthLayout";
import UserPageLayout from "./layout/UserPageLayout";

// Utilities
import ScrollToTop from "./utils/ScrollToTop";

// Public pages
import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import SignUp from "./pages/SignUp/SignUp";
import Login from "./pages/Login/Login";

// User pages
import Browse from "./pages/Browse/Browse";
import ReportItem from "./pages/ReportItem/ReportItem";
import MyReport from "./pages/MyReport/MyReport";
import MyClaims from "./pages/MyClaims/MyClaims";
import Notifications from "./pages/Notifications/Notifications";

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isPublic={true}>
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
            <ProtectedRoute isAuthenticated={isAuthenticated} isPublic={true}>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserPageLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/browse-items" element={<Browse />} />
          <Route path="/report-item" element={<ReportItem />} />
          <Route path="/my-reports" element={<MyReport />} />
          <Route path="/my-claims" element={<MyClaims />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <AppRoutes />
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
