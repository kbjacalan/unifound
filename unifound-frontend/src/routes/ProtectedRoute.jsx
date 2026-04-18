import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, isAuthenticated, isPublic = false }) => {
  const location = useLocation();

  // Logged-in users shouldn't access public/auth pages
  if (isPublic && isAuthenticated) {
    return <Navigate to="/browse-items" replace />;
  }

  // Private pages require authentication
  if (!isPublic && !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
