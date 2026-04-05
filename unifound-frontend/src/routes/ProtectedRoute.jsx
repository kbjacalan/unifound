import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({
  children,
  isAuthenticated,
  userRole,
  requiresAdmin = false,
  isPublic = false,
}) => {
  const location = useLocation();
  const isAdmin = userRole === "Administrator";

  if (isPublic && isAuthenticated) {
    return (
      <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
    );
  }

  if (!isPublic && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!isPublic && isAuthenticated && isAdmin && !requiresAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isPublic && requiresAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
