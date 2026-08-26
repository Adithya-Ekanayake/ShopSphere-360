import { useEffect, useState } from "react";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  RotateCcw,
  Headphones,
} from "lucide-react";

import analyticsService from "../services/analyticsService";

import type {
  KPIData,
  MonthlySalesData,
  ProductAnalyticsData,
  CustomerAnalyticsData,
  ReturnsAnalyticsData,
  SupportAnalyticsData,
} from "../services/analyticsService";

import "../styles/dashboard.css";
import "../styles/admin.css";

const Analytics = () => {
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
  const [kpis, setKpis] = useState<KPIData | null>(null);

  const [monthlySales, setMonthlySales] = useState<
    MonthlySalesData[]
  >([]);

  const [products, setProducts] = useState<
    ProductAnalyticsData[]
  >([]);

  const [customers, setCustomers] = useState<
    CustomerAnalyticsData[]
  >([]);

  const [returns, setReturns] = useState<
    ReturnsAnalyticsData[]
  >([]);

  const [support, setSupport] = useState<
    SupportAnalyticsData[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD ANALYTICS DATA
  // ==========================================================

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          kpiData,
          monthlyData,
          productData,
          customerData,
          returnData,
          supportData,
        ] = await Promise.all([
          analyticsService.getKPIs(),
          analyticsService.getMonthlySales(),
          analyticsService.getTopProducts(),
          analyticsService.getCustomers(),
          analyticsService.getReturns(),
          analyticsService.getSupport(),
        ]);

        // ------------------------------------------------------
        // KPI DATA
        // ------------------------------------------------------

        setKpis(kpiData);

        // ------------------------------------------------------
        // MONTHLY SALES
        // ------------------------------------------------------

        setMonthlySales(monthlyData);

        // ------------------------------------------------------
        // PRODUCTS
        // ------------------------------------------------------

        setProducts(productData);

        // ------------------------------------------------------
        // CUSTOMERS
        // ------------------------------------------------------
        /*
          CustomerID is the actual unique identifier
          in the analytics data (C0001, C0002, etc.).

          The backend may return duplicate customer
          records, so we remove duplicates here.

          CustomerKey is used only as a fallback.
        */

        const customerMap = new Map<string, CustomerAnalyticsData>();

        customerData.forEach((customer) => {
          const customerName =
            (customer as any).CustomerName ||
            customer.FullName ||
            `${(customer as any).FirstName ?? ""} ${
              (customer as any).LastName ?? ""
            }`.trim() ||
            customer.CustomerID ||
            "Unknown Customer";

          const uniqueKey = customerName.toUpperCase();

          if (customerMap.has(uniqueKey)) {
            const existing = customerMap.get(uniqueKey)!;
            
            const newOrders = Number(existing.TotalOrders || 0) + Number(customer.TotalOrders || 0);
            const newRevenue = Number(existing.TotalRevenue || 0) + Number(customer.TotalRevenue || 0);
            const newProfit = Number(existing.TotalProfit || 0) + Number(customer.TotalProfit || 0);
            
            existing.TotalOrders = newOrders;
            existing.TotalRevenue = newRevenue;
            existing.TotalProfit = newProfit;
            existing.AverageOrderValue = newOrders > 0 ? newRevenue / newOrders : 0;
          } else {
            customerMap.set(uniqueKey, { ...customer, FullName: customerName });
          }
        });

        const uniqueCustomers = Array.from(customerMap.values())
          .sort((a, b) => Number(b.TotalRevenue || 0) - Number(a.TotalRevenue || 0));

        console.log(
          "Customer records returned:",
          customerData.length
        );

        console.log(
          "Unique customer records:",
          uniqueCustomers.length
        );

        setCustomers(uniqueCustomers);

        // ------------------------------------------------------
        // RETURNS
        // ------------------------------------------------------

        setReturns(returnData);

        // ------------------------------------------------------
        // SUPPORT
        // ------------------------------------------------------

        setSupport(supportData);
      } catch (err) {
        console.error(
          "Failed to load analytics:",
          err
        );

        setError(
          "Unable to load analytics information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // ==========================================================
  // FORMATTERS
  // ==========================================================

  const formatCurrency = (
    value: number | string
  ) => {
    return `LKR ${Number(value || 0).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatNumber = (
    value: number | string
  ) => {
    return Number(value || 0).toLocaleString(
      "en-LK"
    );
  };

  // ==========================================================
  // KPI VALUES
  // ==========================================================

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

  // ==========================================================
  // MONTHLY CHART
  // ==========================================================

  const maxRevenue = Math.max(
    ...monthlySales.map((item) =>
      Number(item.TotalRevenue ?? 0)
    ),
    1
  );

  // ==========================================================
  // RETURN TOTALS
  // ==========================================================

  const totalReturns = returns.reduce(
    (total, item) =>
      total +
      Number(item.QuantityReturned ?? 0),
    0
  );

  const totalRefunds = returns.reduce(
    (total, item) =>
      total +
      Number(
        item.RefundAmount ?? 0
      ),
    0
  );

  // ==========================================================
  // SUPPORT TOTALS
  // ==========================================================

  const totalTickets = support.reduce(
    (total, item) =>
      total +
      1,
    0
  );

  const resolvedTickets = support.reduce(
    (total, item) =>
      total +
      (item.Status === 'Resolved' ? 1 : 0),
    0
  );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-header">
        <div>
          <p className="panel-kicker">
            ANALYTICS
          </p>

          <h1>
            Business Analytics
          </h1>

          <p
            style={{
              marginTop: "5px",
              color:
                "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            Understand sales, products,
            customers and business
            performance.
          </p>
        </div>
      </div>

      {/* =====================================================
          ERROR
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

        {/* REVENUE */}

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
                : formatCurrency(
                    totalRevenue
                  )}
            </strong>

            <small>
              Overall sales revenue
            </small>

          </div>

        </div>

        {/* PROFIT */}

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
                : formatCurrency(
                    totalProfit
                  )}
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

        {/* ORDERS */}

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
                : formatNumber(
                    totalOrders
                  )}
            </strong>

            <small>
              Recorded orders
            </small>

          </div>

        </div>

        {/* CUSTOMERS */}

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <Users size={20} />
          </div>

          <div className="kpi-content">

            <span>
              Customers
            </span>

            <strong>
              {loading
                ? "—"
                : formatNumber(
                    totalCustomers
                  )}
            </strong>

            <small>
              Total customer base
            </small>

          </div>

        </div>

      </section>

      {/* =====================================================
          SALES PERFORMANCE
      ===================================================== */}

      <section
        className="dashboard-grid primary-grid"
        style={{
          marginTop: "20px",
        }}
      >

        {/* MONTHLY REVENUE */}

        <div className="panel sales-panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                SALES PERFORMANCE
              </span>

              <h2>
                Revenue Trend
              </h2>

              <p>
                Monthly revenue performance
              </p>

            </div>

          </div>

          <div
            className="panel-body"
            style={{
              minHeight: "350px",
              display: "flex",
              flexDirection: "column",
              justifyContent:
                "flex-end",
            }}
          >

            {loading ? (

              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color:
                    "var(--text-secondary)",
                }}
              >
                Loading analytics...
              </div>

            ) : monthlySales.length === 0 ? (

              <div
                style={{
                  textAlign: "center",
                  padding: "60px",
                  color:
                    "var(--text-secondary)",
                }}
              >
                No monthly sales data
                available.
              </div>

            ) : (

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "12px",
                  height: "280px",
                  overflowX: "auto",
                  padding:
                    "20px 10px 5px",
                }}
              >

                {monthlySales.map(
                  (month, index) => {

                    const revenue =
                      Number(
                        month.TotalRevenue ??
                          0
                      );

                    const height =
                      Math.max(
                        (revenue /
                          maxRevenue) *
                          220,
                        8
                      );

                    return (

                      <div
                        key={`${month.Year}-${month.Month}-${index}`}
                        style={{
                          minWidth: "55px",
                          height: "100%",
                          display: "flex",
                          flexDirection:
                            "column",
                          justifyContent:
                            "flex-end",
                          alignItems:
                            "center",
                          gap: "8px",
                        }}
                      >

                        <span
                          style={{
                            fontSize: "10px",
                            color:
                              "var(--text-secondary)",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {formatCurrency(
                            revenue
                          )}
                        </span>

                        <div
                          title={`${month.MonthName ?? month.Month} ${month.Year}: ${formatCurrency(revenue)}`}
                          style={{
                            width: "32px",
                            height:
                              `${height}px`,
                            borderRadius:
                              "6px 6px 2px 2px",
                            background:
                              "var(--primary)",
                            transition:
                              "height 0.3s ease",
                          }}
                        />

                        <span
                          style={{
                            fontSize: "11px",
                            color:
                              "var(--text-secondary)",
                            whiteSpace:
                              "nowrap",
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

        {/* KEY METRICS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                PERFORMANCE
              </span>

              <h2>
                Key Metrics
              </h2>

              <p>
                Important business
                indicators
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
                  : `${profitMargin.toFixed(
                      1
                    )}%`}
              </strong>

            </div>

            <div className="metric-item">

              <div>

                <span>
                  Returns
                </span>

                <small>
                  Total returned items
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      totalReturns
                    )}
              </strong>

            </div>

            <div className="metric-item">

              <div>

                <span>
                  Refunds
                </span>

                <small>
                  Total refund amount
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatCurrency(
                      totalRefunds
                    )}
              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          TOP PRODUCTS
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
              PRODUCT PERFORMANCE
            </span>

            <h2>
              Top Products
            </h2>

            <p>
              Best-performing products
              by revenue
            </p>

          </div>

        </div>

        <div className="panel-body">

          {loading ? (

            <p
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              Loading products...
            </p>

          ) : products.length === 0 ? (

            <p
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              No product analytics
              available.
            </p>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Product
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Units Sold
                    </th>

                    <th>
                      Revenue
                    </th>

                    <th>
                      Profit
                    </th>

                    <th>
                      Margin
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {products.map(
                    (product) => {

                      const margin =
                        Number(
                          product.ProfitMarginPercent ??
                            0
                        );

                      return (

                        <tr
                          key={
                            product.ProductKey
                          }
                        >

                          <td>

                            <strong>
                              {
                                product.ProductName
                              }
                            </strong>

                          </td>

                          <td>
                            {
                              product.Category
                            }
                          </td>

                          <td>
                            {formatNumber(
                              product.UnitsSold
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              product.TotalRevenue
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              product.TotalProfit
                            )}
                          </td>

                          <td>
                            {margin.toFixed(
                              1
                            )}
                            %
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
          CUSTOMER ANALYTICS
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
              CUSTOMER PERFORMANCE
            </span>

            <h2>
              Top Customers
            </h2>

            <p>
              Customers generating the
              highest revenue
            </p>

          </div>

        </div>

        <div className="panel-body">

          {loading ? (

            <p
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              Loading customers...
            </p>

          ) : customers.length === 0 ? (

            <p
              style={{
                color:
                  "var(--text-secondary)",
              }}
            >
              No customer analytics
              available.
            </p>

          ) : (

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>

                    <th>
                      Customer
                    </th>

                    <th>
                      Country
                    </th>

                    <th>
                      Orders
                    </th>

                    <th>
                      Revenue
                    </th>

                    <th>
                      Profit
                    </th>

                    <th>
                      AOV
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {customers
                    .slice(0, 10)
                    .map(
                      (customer) => {

                        /*
                          Support both API formats:

                          1. FullName
                          2. FirstName + LastName
                        */

                        const customerName =
                          (customer as any).CustomerName ||
                          customer.FullName ||
                          `${(
                            customer as any
                          ).FirstName ?? ""} ${
                            (
                              customer as any
                            ).LastName ?? ""
                          }`.trim();

                        return (

                          <tr
                            key={
                              customer.CustomerID ??
                              customer.CustomerKey
                            }
                          >

                            <td>

                              <strong>
                                {customerName ||
                                  customer.CustomerID ||
                                  "Unknown Customer"}
                              </strong>

                            </td>

                            <td>
                              {
                                customer.Country
                              }
                            </td>

                            <td>
                              {formatNumber(
                                customer.TotalOrders
                              )}
                            </td>

                            <td>
                              {formatCurrency(
                                customer.TotalRevenue
                              )}
                            </td>

                            <td>
                              {formatCurrency(
                                customer.TotalProfit
                              )}
                            </td>

                            <td>
                              {formatCurrency(
                                customer.AverageOrderValue
                              )}
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
          RETURNS + SUPPORT
      ===================================================== */}

      <section
        className="dashboard-grid primary-grid"
        style={{
          marginTop: "20px",
        }}
      >

        {/* RETURNS */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                RETURNS
              </span>

              <h2>
                Returns Analysis
              </h2>

              <p>
                Product return performance
              </p>

            </div>

            <RotateCcw size={20} />

          </div>

          <div className="metric-list">

            {returns.length === 0 ? (

              <div className="metric-item">

                <span>
                  No return data
                </span>

              </div>

            ) : (

              returns
                .slice(0, 5)
                .map(
                  (item, index) => (

                    <div
                      className="metric-item"
                      key={index}
                    >

                      <div>

                        <span>
                          {item.ReturnReason ??
                            "Returns"}
                        </span>

                        <small>
                          {
                            item.ReturnRatePercent
                          }
                          % return rate
                        </small>

                      </div>

                      <strong>
                        {formatNumber(
                          item.QuantityReturned
                        )}
                      </strong>

                    </div>

                  )
                )

            )}

          </div>

        </div>

        {/* SUPPORT */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <span className="panel-kicker">
                CUSTOMER SUPPORT
              </span>

              <h2>
                Support Overview
              </h2>

              <p>
                Customer support activity
              </p>

            </div>

            <Headphones size={20} />

          </div>

          <div className="metric-list">

            <div className="metric-item">

              <div>

                <span>
                  Total Tickets
                </span>

                <small>
                  Recorded support
                  requests
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      totalTickets
                    )}
              </strong>

            </div>

            <div className="metric-item">

              <div>

                <span>
                  Resolved Tickets
                </span>

                <small>
                  Successfully resolved
                </small>

              </div>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      resolvedTickets
                    )}
              </strong>

            </div>

            <div className="metric-item">

              <div>

                <span>
                  Resolution Rate
                </span>

                <small>
                  Overall support
                  performance
                </small>

              </div>

              <strong>

                {totalTickets > 0
                  ? `${(
                      (resolvedTickets /
                        totalTickets) *
                      100
                    ).toFixed(1)}%`
                  : "0%"}

              </strong>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          BUSINESS INSIGHTS
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
              BUSINESS INSIGHTS
            </span>

            <h2>
              Analytics Overview
            </h2>

            <p>
              Use these metrics to identify
              opportunities and monitor
              business performance.
            </p>

          </div>

        </div>

        <div className="insights-grid">

          {/* REVENUE */}

          <div className="insight-card">

            <div className="insight-icon">
              <BarChart3 size={19} />
            </div>

            <div>

              <span>
                Revenue
              </span>

              <strong>
                {loading
                  ? "—"
                  : formatCurrency(
                      totalRevenue
                    )}
              </strong>

              <p>
                Total recorded revenue
              </p>

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="insight-card">

            <div className="insight-icon">
              <Package size={19} />
            </div>

            <div>

              <span>
                Products
              </span>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      products.length
                    )}
              </strong>

              <p>
                Top products analyzed
              </p>

            </div>

          </div>

          {/* CUSTOMERS */}

          <div className="insight-card">

            <div className="insight-icon">
              <Users size={19} />
            </div>

            <div>

              <span>
                Customers
              </span>

              <strong>
                {loading
                  ? "—"
                  : formatNumber(
                      totalCustomers
                    )}
              </strong>

              <p>
                Customers in the database
              </p>

            </div>

          </div>

          {/* PROFIT MARGIN */}

          <div className="insight-card">

            <div className="insight-icon">
              <TrendingUp size={19} />
            </div>

            <div>

              <span>
                Profit Margin
              </span>

              <strong>
                {loading
                  ? "—"
                  : `${profitMargin.toFixed(
                      1
                    )}%`}
              </strong>

              <p>
                Overall profitability
              </p>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default Analytics;