import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  CalendarDays,
  ArrowUpRight,
} from "lucide-react";

import analyticsService from "../services/analyticsService";
import type {
  KPIData,
  MonthlySalesData,
} from "../types/analytics";

import "../styles/dashboard.css";
import "../styles/admin.css";

const SalesOverview = () => {
  /* =========================================================
     DARK MODE
     ========================================================= */

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("shopsphere-theme") === "dark";
  });

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);

    localStorage.setItem(
      "shopsphere-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  /* =========================================================
     STATE
     ========================================================= */

  const [kpis, setKpis] = useState<KPIData | null>(null);

  const [monthlySales, setMonthlySales] = useState<
    MonthlySalesData[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD SALES DATA
     ========================================================= */

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        setLoading(true);
        setError("");

        const [kpiData, monthlyData] = await Promise.all([
          analyticsService.getKPIs(),
          analyticsService.getMonthlySales(),
        ]);

        setKpis(kpiData);
        setMonthlySales(monthlyData);
      } catch (err) {
        console.error("Failed to load sales data:", err);

        setError(
          "Unable to load sales information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, []);

  /* =========================================================
     KPI VALUES
     ========================================================= */

  const totalRevenue = Number(
    kpis?.TotalRevenue ?? 0
  );

  const totalProfit = Number(
    kpis?.TotalProfit ?? 0
  );

  const totalOrders = Number(
    kpis?.TotalOrders ?? 0
  );

  const totalCustomers = Number(
    kpis?.TotalCustomers ?? 0
  );

  const averageOrderValue = Number(
    kpis?.AverageOrderValue ?? 0
  );

  const profitMargin = Number(
    kpis?.ProfitMarginPercent ?? 0
  );

  /* =========================================================
     FORMATTERS
     ========================================================= */

  const formatCurrency = (value: number) => {
    return `LKR ${value.toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value: number) => {
    return value.toLocaleString("en-LK");
  };

  const formatCompactCurrency = (value: number) => {
    if (value >= 1_000_000) {
      return `LKR ${(value / 1_000_000).toFixed(1)}M`;
    }

    if (value >= 1_000) {
      return `LKR ${(value / 1_000).toFixed(1)}K`;
    }

    return `LKR ${value.toFixed(0)}`;
  };

  /* =========================================================
     MONTHLY SALES SUMMARY
     ========================================================= */

  const salesSummary = useMemo(() => {
    return monthlySales.reduce(
      (total, month) => ({
        revenue:
          total.revenue +
          Number(month.TotalRevenue ?? 0),

        profit:
          total.profit +
          Number(month.TotalProfit ?? 0),

        orders:
          total.orders +
          Number(month.TotalOrders ?? 0),
      }),
      {
        revenue: 0,
        profit: 0,
        orders: 0,
      }
    );
  }, [monthlySales]);

  /* =========================================================
     MAX REVENUE FOR BAR GRAPH
     ========================================================= */

  const maxRevenue = Math.max(
    ...monthlySales.map((month) =>
      Number(month.TotalRevenue ?? 0)
    ),
    1
  );

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="dashboard">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-header">

        <div>
          <p className="panel-kicker">
            SALES
          </p>

          <h1>
            Sales Overview
          </h1>

          <p
            style={{
              marginTop: "5px",
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Monitor revenue, profit and order
            performance.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-secondary)",
            fontSize: "14px",
          }}
        >
          <CalendarDays size={16} />

          <span>
            All Time
          </span>
        </div>

      </div>

      {/* =====================================================
          ERROR MESSAGE
          ===================================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <section className="kpi-grid">

        {/* TOTAL REVENUE */}

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <DollarSign size={20} />
          </div>

          <div className="kpi-content">

            <span>
              Total Revenue
            </span>

            <strong>
              {loading
                ? "—"
                : formatCurrency(totalRevenue)}
            </strong>

            <small>
              All-time sales revenue
            </small>

          </div>

        </div>

        {/* TOTAL PROFIT */}

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <TrendingUp size={20} />
          </div>

          <div className="kpi-content">

            <span>
              Total Profit
            </span>

            <strong>
              {loading
                ? "—"
                : formatCurrency(totalProfit)}
            </strong>

            <small>
              {loading
                ? "Calculating..."
                : `${profitMargin.toFixed(
                    1
                  )}% profit margin`}
            </small>

          </div>

        </div>

        {/* TOTAL ORDERS */}

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <ShoppingCart size={20} />
          </div>

          <div className="kpi-content">

            <span>
              Total Orders
            </span>

            <strong>
              {loading
                ? "—"
                : formatNumber(totalOrders)}
            </strong>

            <small>
              Completed orders
            </small>

          </div>

        </div>

        {/* AVERAGE ORDER VALUE */}

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <BarChart3 size={20} />
          </div>

          <div className="kpi-content">

            <span>
              Average Order Value
            </span>

            <strong>
              {loading
                ? "—"
                : formatCurrency(
                    averageOrderValue
                  )}
            </strong>

            <small>
              Revenue per order
            </small>

          </div>

        </div>

      </section>

      {/* =====================================================
          MAIN SALES AREA
          ===================================================== */}

      <section
        className="dashboard-grid primary-grid"
        style={{
          marginTop: "20px",
        }}
      >

        {/* ===================================================
            MONTHLY SALES
            =================================================== */}

        <div className="panel sales-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                PERFORMANCE
              </span>

              <h2>
                Monthly Sales
              </h2>

              <p>
                Revenue performance over time
              </p>

            </div>

          </div>

          <div className="panel-body">

            {loading ? (

              <div className="chart-status">
                <p>
                  Loading sales data...
                </p>
              </div>

            ) : monthlySales.length === 0 ? (

              <div className="chart-status">
                <p>
                  No monthly sales data available.
                </p>
              </div>

            ) : (

              <div
                className="sales-bars"
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "10px",
                  minHeight: "300px",
                  overflowX: "auto",
                  padding: "20px 10px 10px",
                }}
              >

                {monthlySales.map(
                  (month, index) => {

                    const revenue = Number(
                      month.TotalRevenue ?? 0
                    );

                    const height = Math.max(
                      (revenue / maxRevenue) * 230,
                      8
                    );

                    return (

                      <div
                        key={`${month.Year}-${month.Month}-${index}`}
                        className="sales-bar-item"
                        style={{
                          minWidth: "55px",
                          height: "270px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >

                        <span
                          className="sales-bar-value"
                          style={{
                            fontSize: "10px",
                            color:
                              "var(--text-secondary)",
                            whiteSpace: "nowrap",
                            transform:
                              "rotate(-30deg)",
                            transformOrigin:
                              "bottom left",
                            marginBottom: "5px",
                          }}
                        >
                          {formatCompactCurrency(
                            revenue
                          )}
                        </span>

                        <div
                          className="sales-bar"
                          title={`${month.MonthName ?? month.Month} ${month.Year}: ${formatCurrency(revenue)}`}
                          style={{
                            width: "34px",
                            height: `${height}px`,
                            borderRadius:
                              "6px 6px 2px 2px",
                            background:
                              "var(--primary)",
                            transition:
                              "height 0.3s ease",
                          }}
                        />

                        <span
                          className="sales-bar-label"
                          style={{
                            fontSize: "11px",
                            color:
                              "var(--text-secondary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {month.MonthName ??
                            `M${month.Month}`}
                        </span>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

        {/* ===================================================
            SALES SUMMARY
            =================================================== */}

        <div className="panel metrics-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                SUMMARY
              </span>

              <h2>
                Sales Summary
              </h2>

              <p>
                Overall sales performance
              </p>

            </div>

          </div>

          <div className="metric-list">

            {/* REVENUE */}

            <div className="metric-item">

              <div>

                <span>
                  Revenue
                </span>

                <small>
                  Recorded sales
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatCurrency(
                      totalRevenue
                    )}
              </strong>

            </div>

            {/* PROFIT */}

            <div className="metric-item">

              <div>

                <span>
                  Profit
                </span>

                <small>
                  Generated profit
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatCurrency(
                      totalProfit
                    )}
              </strong>

            </div>

            {/* ORDERS */}

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
                  : formatNumber(
                      totalOrders
                    )}
              </strong>

            </div>

            {/* CUSTOMERS */}

            <div className="metric-item">

              <div>

                <span>
                  Customers
                </span>

                <small>
                  Active customer base
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      totalCustomers
                    )}
              </strong>

            </div>

            {/* PROFIT MARGIN */}

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
                  : `${profitMargin.toFixed(
                      1
                    )}%`}
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          MONTHLY PERFORMANCE TABLE
          ===================================================== */}

      <section
        className="panel"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="panel-header">

          <div>

            <span className="panel-kicker">
              BREAKDOWN
            </span>

            <h2>
              Monthly Performance
            </h2>

            <p>
              Revenue, profit and order volume
              by month
            </p>

          </div>

        </div>

        <div className="panel-body">

          {loading ? (

            <div className="chart-status">
              <p>
                Loading...
              </p>
            </div>

          ) : monthlySales.length === 0 ? (

            <div className="chart-status">
              <p>
                No sales records available.
              </p>
            </div>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Year
                    </th>

                    <th>
                      Month
                    </th>

                    <th>
                      Revenue
                    </th>

                    <th>
                      Profit
                    </th>

                    <th>
                      Orders
                    </th>

                    <th>
                      Profit Margin
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {monthlySales.map(
                    (month, index) => {

                      const revenue = Number(
                        month.TotalRevenue ?? 0
                      );

                      const profit = Number(
                        month.TotalProfit ?? 0
                      );

                      const orders = Number(
                        month.TotalOrders ?? 0
                      );

                      const margin =
                        revenue > 0
                          ? (profit / revenue) * 100
                          : 0;

                      return (

                        <tr
                          key={`${month.Year}-${month.Month}-${index}`}
                        >

                          <td>
                            {month.Year}
                          </td>

                          <td>
                            {month.MonthName ??
                              month.Month}
                          </td>

                          <td>
                            {formatCurrency(
                              revenue
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              profit
                            )}
                          </td>

                          <td>
                            {formatNumber(
                              orders
                            )}
                          </td>

                          <td>
                            {margin.toFixed(1)}%
                          </td>

                        </tr>

                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          QUICK ACTIONS
          ===================================================== */}

      <section
        className="business-insights"
        style={{
          marginTop: "20px",
        }}
      >

        <div className="section-heading">

          <div>

            <span className="panel-kicker">
              SALES MANAGEMENT
            </span>

            <h2>
              Quick Actions
            </h2>

            <p>
              Manage your sales data
            </p>

          </div>

        </div>

        <div className="insights-grid">

          {/* ORDERS */}

          <a
            href="/sales/orders"
            className="insight-card"
          >

            <div className="insight-icon">
              <ShoppingCart size={19} />
            </div>

            <div>

              <span>
                Orders
              </span>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      totalOrders
                    )}
              </strong>

              <p>
                View and manage orders
              </p>

            </div>

            <ArrowUpRight size={17} />

          </a>

          {/* TRANSACTIONS */}

          <a
            href="/sales/transactions"
            className="insight-card"
          >

            <div className="insight-icon">
              <BarChart3 size={19} />
            </div>

            <div>

              <span>
                Transactions
              </span>

              <strong>
                View
              </strong>

              <p>
                Explore individual sales
              </p>

            </div>

            <ArrowUpRight size={17} />

          </a>

          {/* ANALYTICS */}

          <a
            href="/sales/analytics"
            className="insight-card"
          >

            <div className="insight-icon">
              <TrendingUp size={19} />
            </div>

            <div>

              <span>
                Analytics
              </span>

              <strong>
                Explore
              </strong>

              <p>
                Analyze sales performance
              </p>

            </div>

            <ArrowUpRight size={17} />

          </a>

          {/* REPORTS */}

          <a
            href="/sales/reports"
            className="insight-card"
          >

            <div className="insight-icon">
              <DollarSign size={19} />
            </div>

            <div>

              <span>
                Reports
              </span>

              <strong>
                Generate
              </strong>

              <p>
                Create sales reports
              </p>

            </div>

            <ArrowUpRight size={17} />

          </a>

        </div>

      </section>

    </div>
  );
};

export default SalesOverview;