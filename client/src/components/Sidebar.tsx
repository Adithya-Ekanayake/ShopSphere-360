import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  FileText,
  CreditCard,
  Sun,
  Moon,
  TrendingUp,
} from "lucide-react";

interface SidebarProps {
  darkMode?: boolean;
  onToggleTheme?: () => void;
}

export const Sidebar = ({ darkMode, onToggleTheme }: SidebarProps) => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (targetPath: string) => {
    if (targetPath === "/") {
      return path === "/";
    }
    return path.startsWith(targetPath);
  };

  return (
    <aside className="sidebar">
      {/* BRAND */}
      <div className="brand">
        <div className="brand-icon">
          <BarChart3 size={21} />
        </div>
        <div className="brand-text">
          <h2>
            ShopSphere<span>360</span>
          </h2>
          <p>Business Intelligence</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="sidebar-nav">
        <Link
          to="/"
          className={`nav-item ${isActive("/") ? "active" : ""}`}
        >
          <BarChart3 size={17} />
          <span>Dashboard</span>
        </Link>

        <p className="nav-label">MANAGEMENT</p>

        <Link
          to="/products"
          className={`nav-item ${isActive("/products") ? "active" : ""}`}
        >
          <Package size={17} />
          <span>Products</span>
        </Link>

        <Link
          to="/customers"
          className={`nav-item ${isActive("/customers") ? "active" : ""}`}
        >
          <Users size={17} />
          <span>Customers</span>
        </Link>

        <p className="nav-label">SALES & ORDERS</p>

        <Link
          to="/sales"
          className={`nav-item ${path === "/sales" ? "active" : ""}`}
        >
          <ShoppingCart size={17} />
          <span>Sales Overview</span>
        </Link>

        <Link
          to="/sales/orders"
          className={`nav-item ${isActive("/sales/orders") ? "active" : ""}`}
        >
          <ShoppingCart size={17} />
          <span>Orders</span>
        </Link>

        <Link
          to="/sales/transactions"
          className={`nav-item ${isActive("/sales/transactions") || path === "/transactions" ? "active" : ""}`}
        >
          <CreditCard size={17} />
          <span>Transactions</span>
        </Link>

        <p className="nav-label">ANALYTICS</p>

        <Link
          to="/analytics"
          className={`nav-item ${isActive("/analytics") ? "active" : ""}`}
        >
          <TrendingUp size={17} />
          <span>Analytics</span>
        </Link>

        <Link
          to="/reports"
          className={`nav-item ${isActive("/reports") ? "active" : ""}`}
        >
          <FileText size={17} />
          <span>Reports</span>
        </Link>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
          <span className="status-dot" />
          <div>
            <strong>System Online</strong>
            <span>MySQL connected</span>
          </div>
        </div>

        {onToggleTheme && (
          <button
            type="button"
            className="theme-toggle"
            onClick={onToggleTheme}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
            style={{ width: "32px", height: "32px", borderRadius: "6px" }}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
