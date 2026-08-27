import { useNavigate } from "react-router-dom";
import { LogOut, Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AccountControlsProps {
  darkMode: boolean;
  onToggleTheme: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  Admin: "var(--primary)",
  Manager: "#0ea5e9",
  Analyst: "#10b981",
};

const AccountControls = ({ darkMode, onToggleTheme }: AccountControlsProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  return (
    <div className="account-controls" aria-label="Account controls">
      <div className="account-identity">
        <div
          className="account-avatar"
          style={{ background: ROLE_COLORS[user.Role] ?? "var(--primary)" }}
        >
          {user.FullName.charAt(0).toUpperCase()}
        </div>
        <div className="account-details">
          <strong>{user.FullName}</strong>
          <span style={{ color: ROLE_COLORS[user.Role] ?? "var(--primary)" }}>
            {user.Role}
          </span>
          <span className="account-status">
            <span className="status-dot" />
            <span>Online</span>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="theme-toggle"
        onClick={onToggleTheme}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <button
        type="button"
        className="theme-toggle account-sign-out"
        onClick={handleLogout}
        title="Sign out"
        aria-label="Sign out"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
};

export default AccountControls;
