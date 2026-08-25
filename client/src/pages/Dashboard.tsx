import {
  BarChart3,
  ChevronDown,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import "../styles/dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <BarChart3 size={22} />
          </div>

          <div>
            <h2>ShopSphere<span>360</span></h2>
            <p>Business Intelligence</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">OVERVIEW</p>

          <a className="nav-item active" href="/">
            <BarChart3 size={18} />
            Dashboard
          </a>

          <p className="nav-label">ANALYTICS</p>

          <a className="nav-item" href="#">
            <ShoppingCart size={18} />
            Sales
          </a>

          <a className="nav-item" href="#">
            <Users size={18} />
            Customers
          </a>

          <a className="nav-item" href="#">
            <Package size={18} />
            Products
          </a>

          <a className="nav-item" href="#">
            <BarChart3 size={18} />
            Marketing
          </a>

          <a className="nav-item" href="#">
            <DollarSign size={18} />
            Returns
          </a>

          <a className="nav-item" href="#">
            <Users size={18} />
            Support
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="status-dot"></div>
          <div>
            <strong>System Online</strong>
            <span>MySQL connected</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">OVERVIEW</p>
            <h1>Business Dashboard</h1>
          </div>

          <button className="period-selector">
            All Time
            <ChevronDown size={16} />
          </button>
        </header>

        <section className="welcome">
          <div>
            <h2>Welcome to ShopSphere360 👋</h2>
            <p>
              Monitor your business performance, customers, products and
              marketing activity from one place.
            </p>
          </div>
        </section>

        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon blue">
              <ShoppingCart size={21} />
            </div>

            <div>
              <p>Total Orders</p>
              <h3>4,500</h3>
              <span className="positive">+12.5%</span>
              <small>vs previous period</small>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon purple">
              <Users size={21} />
            </div>

            <div>
              <p>Total Customers</p>
              <h3>450</h3>
              <span className="positive">+8.2%</span>
              <small>vs previous period</small>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon green">
              <DollarSign size={21} />
            </div>

            <div>
              <p>Total Revenue</p>
              <h3>Rs. 183.35M</h3>
              <span className="positive">+14.8%</span>
              <small>vs previous period</small>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon orange">
              <BarChart3 size={21} />
            </div>

            <div>
              <p>Total Profit</p>
              <h3>Rs. 57.69M</h3>
              <span className="positive">31.46%</span>
              <small>profit margin</small>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel large-panel">
            <div className="panel-header">
              <div>
                <h3>Sales Performance</h3>
                <p>Revenue and profit over time</p>
              </div>

              <button className="panel-action">
                Monthly
                <ChevronDown size={15} />
              </button>
            </div>

            <div className="chart-placeholder">
              <BarChart3 size={42} />
              <p>Sales chart coming next</p>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Key Metrics</h3>
                <p>Current business performance</p>
              </div>
            </div>

            <div className="metric-list">
              <div>
                <span>Average Order Value</span>
                <strong>Rs. 40,743.90</strong>
              </div>

              <div>
                <span>Profit Margin</span>
                <strong>31.46%</strong>
              </div>

              <div>
                <span>Customers</span>
                <strong>450</strong>
              </div>

              <div>
                <span>Orders</span>
                <strong>4,500</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;