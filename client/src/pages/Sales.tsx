import { useEffect, useState } from "react";
import {
  BarChart3,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

import salesService from "../services/salesService";

import type {
  SalesKPI,
  MonthlySales,
  ChannelSales,
  RecentOrder,
} from "../types/sales";

import "../styles/dashboard.css";
import "../styles/sales.css";

const Sales = () => {
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
  const [kpis, setKpis] = useState<SalesKPI | null>(null);
  const [monthlySales, setMonthlySales] = useState<MonthlySales[]>([]);
  const [channelSales, setChannelSales] = useState<ChannelSales[]>([]);
  const [orders, setOrders] = useState<RecentOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        kpiData,
        monthlyData,
        channelData,
        orderData,
      ] = await Promise.all([
        salesService.getKPIs(),
        salesService.getMonthlySales(),
        salesService.getChannelSales(),
        salesService.getRecentOrders(),
      ]);

      setKpis(kpiData);
      setMonthlySales(monthlyData);
      setChannelSales(channelData);
      setOrders(orderData);
    } catch (err) {
      console.error("Failed to load sales data:", err);
      setError("Unable to load sales data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalesData();
  }, []);

  const number = (value: number | string | undefined) =>
    Number(value ?? 0);

  const currency = (value: number | string | undefined) =>
    `LKR ${number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <div className="sales-page">

      {/* HEADER */}

      <div className="sales-header">
        <div>
          <span className="sales-kicker">
            SALES
          </span>

          <h1>
            Sales Overview
          </h1>

          <p>
            Monitor revenue, orders, profitability and
            sales performance.
          </p>
        </div>

        <button
          className="sales-refresh"
          onClick={loadSalesData}
          disabled={loading}
        >
          <RefreshCw size={16} />

          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="sales-error">
          {error}
        </div>
      )}

      {/* KPI CARDS */}

      <section className="sales-kpi-grid">

        <div className="sales-kpi-card">
          <div className="sales-kpi-icon">
            <DollarSign size={20} />
          </div>

          <div>
            <span>Total Revenue</span>

            <strong>
              {loading
                ? "—"
                : currency(kpis?.TotalRevenue)}
            </strong>

            <small>
              All recorded sales
            </small>
          </div>
        </div>

        <div className="sales-kpi-card">
          <div className="sales-kpi-icon">
            <ShoppingCart size={20} />
          </div>

          <div>
            <span>Total Orders</span>

            <strong>
              {loading
                ? "—"
                : number(kpis?.TotalOrders).toLocaleString()}
            </strong>

            <small>
              Orders recorded
            </small>
          </div>
        </div>

        <div className="sales-kpi-card">
          <div className="sales-kpi-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>Total Profit</span>

            <strong>
              {loading
                ? "—"
                : currency(kpis?.TotalProfit)}
            </strong>

            <small>
              {loading
                ? "Calculating..."
                : `${number(
                    kpis?.ProfitMarginPercent
                  ).toFixed(2)}% margin`}
            </small>
          </div>
        </div>

        <div className="sales-kpi-card">
          <div className="sales-kpi-icon">
            <BarChart3 size={20} />
          </div>

          <div>
            <span>Average Order Value</span>

            <strong>
              {loading
                ? "—"
                : currency(kpis?.AverageOrderValue)}
            </strong>

            <small>
              Average revenue per order
            </small>
          </div>
        </div>

      </section>

      {/* MONTHLY SALES */}

      <section className="sales-panel">

        <div className="sales-panel-header">
          <div>
            <span>PERFORMANCE</span>

            <h2>
              Monthly Sales
            </h2>

            <p>
              Revenue, profit and order volume over time.
            </p>
          </div>
        </div>

        <div className="sales-table-wrapper">

          <table className="sales-table">

            <thead>
              <tr>
                <th>Period</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Profit</th>
              </tr>
            </thead>

            <tbody>

              {monthlySales.map((month) => (

                <tr
                  key={`${month.Year}-${month.Month}`}
                >
                  <td>
                    <strong>
                      {month.MonthName}
                    </strong>{" "}
                    {month.Year}
                  </td>

                  <td>
                    {number(
                      month.TotalOrders
                    ).toLocaleString()}
                  </td>

                  <td>
                    {currency(
                      month.TotalRevenue
                    )}
                  </td>

                  <td>
                    {currency(
                      month.TotalProfit
                    )}
                  </td>
                </tr>

              ))}

            </tbody>

          </table>

          {!loading &&
            monthlySales.length === 0 && (
              <div className="sales-empty">
                No monthly sales data available.
              </div>
            )}

        </div>

      </section>

      {/* CHANNEL SALES */}

      <section className="sales-panel">

        <div className="sales-panel-header">
          <div>
            <span>CHANNELS</span>

            <h2>
              Sales by Channel
            </h2>

            <p>
              Compare sales performance across channels.
            </p>
          </div>
        </div>

        <div className="channel-grid">

          {channelSales.map((channel) => (

            <div
              className="channel-card"
              key={channel.ChannelName}
            >
              <span>
                {channel.ChannelName}
              </span>

              <strong>
                {currency(
                  channel.TotalRevenue
                )}
              </strong>

              <small>
                {number(
                  channel.TotalOrders
                ).toLocaleString()} orders
              </small>
            </div>

          ))}

        </div>

      </section>

      {/* RECENT ORDERS */}

      <section className="sales-panel">

        <div className="sales-panel-header">

          <div>
            <span>ORDERS</span>

            <h2>
              Recent Orders
            </h2>

            <p>
              Latest orders recorded in the system.
            </p>
          </div>

        </div>

        <div className="sales-table-wrapper">

          <table className="sales-table">

            <thead>

              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Channel</th>
                <th>Location</th>
                <th>Status</th>
                <th>Total</th>
              </tr>

            </thead>

            <tbody>

              {orders.map((order) => (

                <tr key={order.OrderKey}>

                  <td>
                    <strong>
                      {order.OrderID}
                    </strong>
                  </td>

                  <td>
                    {order.CustomerName}
                  </td>

                  <td>
                    {new Date(
                      order.OrderDate
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {order.ChannelName}
                  </td>

                  <td>
                    {order.City},{" "}
                    {order.Country}
                  </td>

                  <td>

                    <span
                      className={`order-status ${order.OrderStatus
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {order.OrderStatus}
                    </span>

                  </td>

                  <td>
                    <strong>
                      {currency(
                        order.OrderTotal
                      )}
                    </strong>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {!loading &&
            orders.length === 0 && (
              <div className="sales-empty">
                No orders available.
              </div>
            )}

        </div>

      </section>

    </div>
  );
};

export default Sales;