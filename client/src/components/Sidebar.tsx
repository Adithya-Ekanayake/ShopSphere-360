import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ShoppingCart,
  Users,
  Package,
  FileText,
  CreditCard,
  TrendingUp,
  Sparkles,
  ClipboardCheck,
} from "lucide-react";

export const Sidebar = () => {
  const location = useLocation();

  const path = location.pathname;

  const isActive = (targetPath: string) => {
    if (targetPath === "/") return path === "/";
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
        <div className="sidebar-section">
          <Link to="/" className={`nav-item ${isActive("/") ? "active" : ""}`}>
            <BarChart3 size={17} />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <p className="nav-label">MANAGEMENT</p>
          <Link to="/products" className={`nav-item ${isActive("/products") ? "active" : ""}`}>
            <Package size={17} />
            <span>Products</span>
          </Link>
          <Link to="/customers" className={`nav-item ${isActive("/customers") ? "active" : ""}`}>
            <Users size={17} />
            <span>Customers</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <p className="nav-label">SALES & ORDERS</p>
          <Link to="/sales" className={`nav-item ${path === "/sales" ? "active" : ""}`}>
            <ShoppingCart size={17} />
            <span>Sales Overview</span>
          </Link>
          <Link to="/sales/orders" className={`nav-item ${isActive("/sales/orders") ? "active" : ""}`}>
            <ShoppingCart size={17} />
            <span>Orders</span>
          </Link>
          <Link to="/sales/transactions" className={`nav-item ${isActive("/sales/transactions") || path === "/transactions" ? "active" : ""}`}>
            <CreditCard size={17} />
            <span>Transactions</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <p className="nav-label">ANALYTICS</p>
          <Link to="/analytics" className={`nav-item ${isActive("/analytics") ? "active" : ""}`}>
            <TrendingUp size={17} />
            <span>Analytics</span>
          </Link>
          <Link to="/reports" className={`nav-item ${isActive("/reports") ? "active" : ""}`}>
            <FileText size={17} />
            <span>Reports</span>
          </Link>
          <Link to="/predictions" className={`nav-item ${isActive("/predictions") ? "active" : ""}`}>
            <TrendingUp size={17} />
            <span>Predictions</span>
          </Link>
          <Link to="/advanced-analytics" className={`nav-item ${isActive("/advanced-analytics") ? "active" : ""}`}>
            <Sparkles size={17} />
            <span>Advanced Analytics</span>
          </Link>
          <Link to="/insights" className={`nav-item ${isActive("/insights") ? "active" : ""}`}>
            <Sparkles size={17} />
            <span>Insights</span>
          </Link>
          <Link to="/recommendations" className={`nav-item ${isActive("/recommendations") ? "active" : ""}`}>
            <ClipboardCheck size={17} />
            <span>Recommendations</span>
          </Link>
        </div>
      </nav>

    </aside>
  );
};

export default Sidebar;
