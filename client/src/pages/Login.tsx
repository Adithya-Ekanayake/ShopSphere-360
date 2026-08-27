import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { BarChart3, Eye, EyeOff, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import "../styles/dashboard.css";
import "../styles/admin.css";

const TEST_ACCOUNTS = [
  { label: "Admin", identifier: "admin", password: "Admin@123" },
  { label: "Manager", identifier: "manager", password: "Manager@123" },
  { label: "Analyst", identifier: "analyst", password: "Analyst@123" },
];

const Login = () => {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → go to dashboard
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your username / email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ identifier: identifier.trim(), password });
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed. Check your credentials and try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillAccount = (acc: (typeof TEST_ACCOUNTS)[0]) => {
    setIdentifier(acc.identifier);
    setPassword(acc.password);
    setError("");
  };

  return (
    <div
      className="dashboard"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "var(--primary)",
              color: "#fff",
              marginBottom: "16px",
            }}
          >
            <BarChart3 size={28} />
          </div>
          <h1
            style={{
              margin: "0 0 4px",
              fontSize: "26px",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            ShopSphere<span style={{ color: "var(--primary)" }}>360</span>
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Business Intelligence Platform
          </p>
        </div>

        {/* Card */}
        <div className="panel" style={{ padding: "32px 28px" }}>
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "18px",
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            Sign in to your account
          </h2>
          <p
            style={{
              margin: "0 0 24px",
              color: "var(--text-secondary)",
              fontSize: "13px",
            }}
          >
            Enter your username or email address to continue.
          </p>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "8px",
                padding: "10px 14px",
                marginBottom: "20px",
                color: "#ef4444",
                fontSize: "13px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Identifier */}
            <div>
              <label
                htmlFor="identifier"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: "6px",
                }}
              >
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin or admin@shopsphere360.com"
                autoComplete="username"
                autoFocus
                className="admin-search"
                style={{ width: "100%", boxSizing: "border-box" }}
                disabled={submitting || isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--text)",
                  marginBottom: "6px",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="admin-search"
                  style={{ width: "100%", boxSizing: "border-box", paddingRight: "44px" }}
                  disabled={submitting || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-secondary)",
                    padding: "4px",
                    display: "flex",
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={submitting || isLoading}
              style={{
                width: "100%",
                height: "44px",
                fontSize: "14px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {submitting ? (
                <span className="admin-spinner" style={{ width: "18px", height: "18px" }} />
              ) : (
                <LogIn size={16} />
              )}
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Quick test accounts */}
        <div className="panel" style={{ padding: "20px 28px" }}>
          <p
            style={{
              margin: "0 0 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Quick Fill — Test Accounts
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => fillAccount(acc)}
                className="admin-btn"
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  flex: "1 1 auto",
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
