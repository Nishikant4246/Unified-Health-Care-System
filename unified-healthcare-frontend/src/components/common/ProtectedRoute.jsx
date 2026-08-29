import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const VALID_ROLES = ["admin", "doctor", "patient"];

function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  // Wait until AuthContext finishes restoring the session
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-primary)",
        }}
      >
        <div
          className="animate-spin"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "#10b981",
          }}
        />
      </div>
    );
  }

  // Not logged in, or a broken/tampered session with no valid role
  if (!user || !VALID_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but for the wrong section — send to their own dashboard
  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
}

export default ProtectedRoute;
