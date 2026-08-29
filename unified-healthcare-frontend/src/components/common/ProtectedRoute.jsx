import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  // Wait until AuthContext finishes checking localStorage
  if (loading) {
    return null;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;