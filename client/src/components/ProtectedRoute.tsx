import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types/auth";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // While session is being verified, show nothing (avoids flash redirect)
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg)",
          color: "var(--text)",
          fontSize: "15px",
          gap: "12px",
        }}
      >
        <span
          className="admin-spinner"
          style={{ width: "20px", height: "20px" }}
        />
        Verifying session…
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (allowedRoles && !allowedRoles.includes(user.Role)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "12px",
          color: "var(--text)",
        }}
      >
        <span style={{ fontSize: "40px" }}>🔒</span>
        <h2 style={{ margin: 0 }}>Access Denied</h2>
        <p style={{ color: "var(--text-secondary)", margin: 0 }}>
          Your role (<strong>{user.Role}</strong>) doesn't have permission to
          view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
