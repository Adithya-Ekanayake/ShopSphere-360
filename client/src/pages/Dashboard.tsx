import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  BarChart3,
  ChevronDown,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react";

import analyticsService, { type KPIData } from "../services/analyticsService";
import { useFilters } from "../context/FilterContext";

import SalesChart from "../components/charts/SalesChart";
import CustomerAnalyticsChart from "../components/charts/CustomerAnalyticsChart";
import MarketingAnalyticsChart from "../components/charts/MarketingAnalyticsChart";
import ReturnsAnalyticsChart from "../components/charts/ReturnsAnalyticsChart";
import SupportAnalyticsChart from "../components/charts/SupportAnalyticsChart";
import TopProductsChart from "../components/charts/TopProductsChart";
import FilterBar from "../components/FilterBar";
import ExportMenu from "../components/ExportMenu";
import AccountControls from "../components/AccountControls";

import "../styles/dashboard.css";

const Dashboard = () => {
  const { darkMode, toggleTheme } = useOutletContext<{ darkMode: boolean; toggleTheme: () => void }>();
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { filters } = useFilters();

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        setKpis(await analyticsService.getKPIs(filters));
      } catch (err) {
        console.error("Failed to fetch KPIs:", err);
        setError("Unable to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, [filters]);

  const totalOrders = Number(kpis?.TotalOrders ?? 0);
  const totalCustomers = Number(kpis?.TotalCustomers ?? 0);
  const totalRevenue = Number(kpis?.TotalRevenue ?? 0);
  const totalProfit = Number(kpis?.TotalProfit ?? 0);

  const averageOrderValue = Number(
    kpis?.AverageOrderValue ?? 0
  );

  const profitMargin = Number(
    kpis?.ProfitMarginPercent ?? 0
  );

  const formatCurrency = (value: number) =>
    `LKR ${value.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })}`;

  return (
    <>
      {/* TOPBAR */}
      <header className="topbar">
        <div className="page-title">

            <p className="breadcrumb">
              OVERVIEW
            </p>

            <h1>
              Business Dashboard
            </h1>

          </div>

          <div className="topbar-actions">

            <AccountControls darkMode={darkMode} onToggleTheme={toggleTheme} />

          </div>

        </header>

        <FilterBar />

        {/* WELCOME */}

        <section className="welcome">

          <div>
            <span className="welcome-label">
              BUSINESS OVERVIEW
            </span>

            <h2>
              Welcome to ShopSphere360 👋
            </h2>

            <p>
              Monitor sales, customers, products,
              marketing activity and operational
              performance from one dashboard.
            </p>
          </div>

        </section>

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* KPI */}

        <section className="kpi-grid">

          <div className="kpi-card">

            <div className="kpi-icon blue">
              <ShoppingCart size={20} />
            </div>

            <div className="kpi-content">
              <span>Total Orders</span>

              <strong>
                {loading
                  ? "—"
                  : totalOrders.toLocaleString()}
              </strong>

              <small>
                Completed orders
              </small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon blue">
              <Users size={20} />
            </div>

            <div className="kpi-content">
              <span>Total Customers</span>

              <strong>
                {loading
                  ? "—"
                  : totalCustomers.toLocaleString()}
              </strong>

              <small>
                Customer base
              </small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon blue">
              <DollarSign size={20} />
            </div>

            <div className="kpi-content">
              <span>Total Revenue</span>

              <strong>
                {loading
                  ? "—"
                  : `LKR ${totalRevenue.toLocaleString()}`}
              </strong>

              <small>
                All-time revenue
              </small>
            </div>

          </div>

          <div className="kpi-card">

            <div className="kpi-icon blue">
              <BarChart3 size={20} />
            </div>

            <div className="kpi-content">
              <span>Total Profit</span>

              <strong>
                {loading
                  ? "—"
                  : `LKR ${totalProfit.toLocaleString()}`}
              </strong>

              <small>
                {loading
                  ? "Calculating..."
                  : `${profitMargin}% margin`}
              </small>
            </div>

          </div>

        </section>

        {/* SALES + KEY METRICS */}

        <section
          className="dashboard-grid primary-grid"
          id="sales"
        >

          <div className="panel sales-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  SALES
                </span>

                <h2>
                  Sales Performance
                </h2>

                <p>
                  Revenue and profit over time
                </p>
              </div>

              <button
                type="button"
                className="panel-action"
              >
                Monthly
                <ChevronDown size={14} />
              </button>
              <ExportMenu dataset="sales" reportType="sales-summary" />

            </div>

            <div className="panel-body sales-body">
              <SalesChart />
            </div>

          </div>

          <div className="panel metrics-panel">

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  OVERVIEW
                </span>

                <h2>
                  Key Metrics
                </h2>

                <p>
                  Current business performance
                </p>
              </div>

            </div>

            <div className="metric-list">

              <div className="metric-item">
                <div>
                  <span>
                    Average Order Value
                  </span>
                  <small>
                    Revenue per order
                  </small>
                </div>

                <strong>
                  {loading
                    ? "—"
                    : formatCurrency(
                        averageOrderValue
                      )}
                </strong>
              </div>

              <div className="metric-item">
                <div>
                  <span>
                    Profit Margin
                  </span>
                  <small>
                    Overall profitability
                  </small>
                </div>

                <strong>
                  {loading
                    ? "—"
                    : `${profitMargin}%`}
                </strong>
              </div>

              <div className="metric-item">
                <div>
                  <span>
                    Customers
                  </span>
                  <small>
                    Total customer base
                  </small>
                </div>

                <strong>
                  {loading
                    ? "—"
                    : totalCustomers.toLocaleString()}
                </strong>
              </div>

              <div className="metric-item">
                <div>
                  <span>
                    Orders
                  </span>
                  <small>
                    Completed orders
                  </small>
                </div>

                <strong>
                  {loading
                    ? "—"
                    : totalOrders.toLocaleString()}
                </strong>
              </div>

            </div>

          </div>

        </section>

        {/* CUSTOMER + PRODUCTS */}

        <section className="dashboard-grid two-grid">

          <div
            className="panel analytics-panel"
            id="customers"
          >

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  CUSTOMERS
                </span>

                <h2>
                  Customer Analytics
                </h2>

                <p>
                  Customer behaviour and segmentation
                </p>
              </div>

            </div>

            <div className="panel-body">
              <CustomerAnalyticsChart />
            </div>

          </div>

          <div
            className="panel analytics-panel"
            id="products"
          >

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  PRODUCTS
                </span>

                <h2>
                  Top Products
                </h2>

                <p>
                  Products generating the highest revenue
                </p>
              </div>

            </div>

            <div className="panel-body">
              <TopProductsChart />
            </div>

          </div>

        </section>

        {/* MARKETING + RETURNS */}

        <section className="dashboard-grid two-grid">

          <div
            className="panel analytics-panel"
            id="marketing"
          >

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  MARKETING
                </span>

                <h2>
                  Marketing Analytics
                </h2>

                <p>
                  Channel efficiency and advertising performance
                </p>
              </div>

            </div>

            <div className="panel-body">
              <MarketingAnalyticsChart />
            </div>

          </div>

          <div
            className="panel analytics-panel"
            id="returns"
          >

            <div className="panel-header">

              <div>
                <span className="panel-kicker">
                  RETURNS
                </span>

                <h2>
                  Returns Analytics
                </h2>

                <p>
                  Returned units and refund performance
                </p>
              </div>

            </div>

            <div className="panel-body">
              <ReturnsAnalyticsChart />
            </div>

          </div>

        </section>

        {/* SUPPORT */}

        <section
          className="panel support-panel"
          id="support"
        >

          <div className="panel-header">

            <div>
              <span className="panel-kicker">
                SUPPORT
              </span>

              <h2>
                Support Analytics
              </h2>

              <p>
                Customer support performance and response times
              </p>
            </div>

          </div>

          <div className="panel-body support-body">
            <SupportAnalyticsChart />
          </div>

        </section>

        {/* BUSINESS INSIGHTS */}

        <section className="business-insights">

          <div className="section-heading">

            <div>
              <span className="panel-kicker">
                INSIGHTS
              </span>

              <h2>
                Business Insights
              </h2>

              <p>
                Important indicators from your business data
              </p>
            </div>

          </div>

          <div className="insights-grid">

            <div className="insight-card">
              <div className="insight-icon">
                <DollarSign size={19} />
              </div>

              <div>
                <span>Average Order Value</span>

                <strong>
                  {loading
                    ? "—"
                    : formatCurrency(
                        averageOrderValue
                      )}
                </strong>

                <p>
                  Average revenue per order
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">
                <Users size={19} />
              </div>

              <div>
                <span>Customer Base</span>

                <strong>
                  {loading
                    ? "—"
                    : totalCustomers.toLocaleString()}
                </strong>

                <p>
                  Customers recorded
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">
                <BarChart3 size={19} />
              </div>

              <div>
                <span>Profit Margin</span>

                <strong>
                  {loading
                    ? "—"
                    : `${profitMargin}%`}
                </strong>

                <p>
                  Overall profitability
                </p>
              </div>
            </div>

            <div className="insight-card">
              <div className="insight-icon">
                <ShoppingCart size={19} />
              </div>

              <div>
                <span>Total Orders</span>

                <strong>
                  {loading
                    ? "—"
                    : totalOrders.toLocaleString()}
                </strong>

                <p>
                  Completed orders
                </p>
              </div>
            </div>

          </div>

        </section>
    </>
  );
};

export default Dashboard;