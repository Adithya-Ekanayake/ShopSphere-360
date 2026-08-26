import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import ordersService from "../services/ordersService";
import type {
  Order,
  OrderKPI,
} from "../types/orders";

import "../styles/dashboard.css";
import "../styles/admin.css";

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [kpis, setKpis] = useState<OrderKPI | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const ordersPerPage = 10;

  /* ==========================================
     LOAD DATA
     ========================================== */

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const [ordersData, kpiData] =
          await Promise.all([
            ordersService.getOrders(),
            ordersService.getKPIs(),
          ]);

        setOrders(ordersData);
        setKpis(kpiData);
      } catch (err) {
        console.error(
          "Failed to load orders:",
          err
        );

        setError(
          "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  /* ==========================================
     FORMATTERS
     ========================================== */

  const formatCurrency = (
    value: number | string
  ) => {
    const amount = Number(value || 0);

    return `LKR ${amount.toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-LK",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );
  };

  /* ==========================================
     FILTER ORDERS
     ========================================== */

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order.OrderID
          ?.toLowerCase()
          .includes(searchValue) ||
        order.CustomerName
          ?.toLowerCase()
          .includes(searchValue) ||
        order.CustomerID
          ?.toLowerCase()
          .includes(searchValue) ||
        order.ChannelName
          ?.toLowerCase()
          .includes(searchValue) ||
        order.City
          ?.toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        order.OrderStatus ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  /* ==========================================
     PAGINATION
     ========================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
        ordersPerPage
    )
  );

  const paginatedOrders =
    filteredOrders.slice(
      (currentPage - 1) *
        ordersPerPage,
      currentPage *
        ordersPerPage
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
  ]);

  /* ==========================================
     STATUS CLASS
     ========================================== */

  const getStatusClass = (
    status: string
  ) => {
    const value =
      status?.toLowerCase();

    if (
      value === "completed" ||
      value === "delivered" ||
      value === "paid"
    ) {
      return "status-success";
    }

    if (
      value === "pending" ||
      value === "processing"
    ) {
      return "status-warning";
    }

    if (
      value === "cancelled" ||
      value === "failed"
    ) {
      return "status-danger";
    }

    return "status-neutral";
  };

  /* ==========================================
     LOADING
     ========================================== */

  if (loading) {
    return (
      <div className="chart-status" style={{ marginTop: "32px" }}>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <>
      {/* ======================================
          HEADER
          ====================================== */}

      <div className="admin-header">

        <div>
          <p className="panel-kicker">
            SALES MANAGEMENT
          </p>

          <h1>Orders</h1>

          <p
            style={{
              marginTop: "5px",
              color:
                "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            View and manage customer
            orders.
          </p>
        </div>

      </div>

      {/* ======================================
          ERROR
          ====================================== */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* ======================================
          KPI CARDS
          ====================================== */}

      <section className="kpi-grid">

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <Package size={20} />
          </div>

          <div className="kpi-content">
            <span>Total Orders</span>

            <strong>
              {kpis?.TotalOrders
                ?.toLocaleString() ??
                0}
            </strong>

            <small>
              All orders
            </small>
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <CheckCircle2
              size={20}
            />
          </div>

          <div className="kpi-content">
            <span>Completed</span>

            <strong>
              {kpis?.CompletedOrders
                ?.toLocaleString() ??
                0}
            </strong>

            <small>
              Successfully completed
            </small>
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <Clock3 size={20} />
          </div>

          <div className="kpi-content">
            <span>Pending</span>

            <strong>
              {kpis?.PendingOrders
                ?.toLocaleString() ??
                0}
            </strong>

            <small>
              Awaiting processing
            </small>
          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-icon blue">
            <XCircle size={20} />
          </div>

          <div className="kpi-content">
            <span>Cancelled</span>

            <strong>
              {kpis?.CancelledOrders
                ?.toLocaleString() ??
                0}
            </strong>

            <small>
              Cancelled orders
            </small>
          </div>

        </div>

      </section>

      {/* ======================================
          ORDERS PANEL
          ====================================== */}

      <section
        className="panel"
        style={{
          marginTop: "20px",
        }}
      >

        {/* HEADER */}

        <div className="panel-header">

          <div>
            <span className="panel-kicker">
              ORDER MANAGEMENT
            </span>

            <h2>
              All Orders
            </h2>

            <p>
              Browse customer orders
              from the database.
            </p>
          </div>

        </div>

        {/* FILTER BAR */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            padding:
              "0 24px 20px",
            flexWrap: "wrap",
          }}
        >

          {/* SEARCH */}

          <div
            style={{
              position:
                "relative",
              flex: "1 1 300px",
            }}
          >

            <Search
              size={17}
              style={{
                position:
                  "absolute",
                left: "13px",
                top: "50%",
                transform:
                  "translateY(-50%)",
                color:
                  "var(--text-secondary)",
              }}
            />

            <input
              type="text"
              placeholder="Search orders, customers, channels..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                height: "42px",
                padding:
                  "0 14px 0 40px",
                border:
                  "1px solid var(--border)",
                borderRadius:
                  "8px",
                background:
                  "var(--surface)",
                color:
                  "var(--text-primary)",
                outline: "none",
              }}
            />

          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            style={{
              height: "42px",
              padding:
                "0 35px 0 13px",
              border:
                "1px solid var(--border)",
              borderRadius:
                "8px",
              background:
                "var(--surface)",
              color:
                "var(--text-primary)",
              cursor: "pointer",
              outline: "none",
            }}
          >

            <option value="All">
              All Statuses
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Pending">
              Pending
            </option>

            <option value="Cancelled">
              Cancelled
            </option>

          </select>

        </div>

        {/* TABLE */}

        <div className="panel-body">

          <div className="admin-table-wrapper">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>
                    Order ID
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Channel
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Order Status
                  </th>

                  <th>
                    Payment
                  </th>

                  <th>
                    Shipping
                  </th>

                  <th>
                    Total
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {paginatedOrders.length ===
                0 ? (

                  <tr>
                    <td
                      colSpan={10}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "50px",
                        color:
                          "var(--text-secondary)",
                      }}
                    >
                      No orders found.
                    </td>
                  </tr>

                ) : (

                  paginatedOrders.map(
                    (order) => (

                      <tr
                        key={
                          order.OrderKey
                        }
                      >

                        <td>
                          <strong>
                            {
                              order.OrderID
                            }
                          </strong>
                        </td>

                        <td>

                          <div>
                            <strong>
                              {
                                order.CustomerName
                              }
                            </strong>

                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "3px",
                                color:
                                  "var(--text-secondary)",
                              }}
                            >
                              {
                                order.CustomerID
                              }
                            </small>
                          </div>

                        </td>

                        <td>
                          {formatDate(
                            order.OrderDate
                          )}
                        </td>

                        <td>
                          {
                            order.ChannelName
                          }
                        </td>

                        <td>

                          <div>
                            <span>
                              {
                                order.City
                              }
                            </span>

                            {order.Country && (
                              <small
                                style={{
                                  display:
                                    "block",
                                  marginTop:
                                    "3px",
                                  color:
                                    "var(--text-secondary)",
                                }}
                              >
                                {
                                  order.Country
                                }
                              </small>
                            )}
                          </div>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              order.OrderStatus
                            )}`}
                          >
                            {
                              order.OrderStatus
                            }
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              order.PaymentStatus
                            )}`}
                          >
                            {
                              order.PaymentStatus
                            }
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${getStatusClass(
                              order.ShippingStatus
                            )}`}
                          >
                            {
                              order.ShippingStatus
                            }
                          </span>

                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              order.OrderTotal
                            )}
                          </strong>
                        </td>

                        <td>

                          <a
                            href={`/sales/orders/${order.OrderKey}`}
                            title="View order"
                            style={{
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              width:
                                "34px",
                              height:
                                "34px",
                              border:
                                "1px solid var(--border)",
                              borderRadius:
                                "7px",
                              color:
                                "var(--text-primary)",
                              textDecoration:
                                "none",
                            }}
                          >
                            <Eye
                              size={16}
                            />
                          </a>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ====================================
            PAGINATION
            ==================================== */}

        {filteredOrders.length >
          0 && (

          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              padding:
                "18px 24px",
              borderTop:
                "1px solid var(--border)",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >

            <span
              style={{
                fontSize:
                  "13px",
                color:
                  "var(--text-secondary)",
              }}
            >
              Showing{" "}
              {
                (currentPage -
                  1) *
                  ordersPerPage +
                  1
              }
              {" – "}
              {Math.min(
                currentPage *
                  ordersPerPage,
                filteredOrders.length
              )}{" "}
              of{" "}
              {
                filteredOrders.length
              }{" "}
              orders
            </span>

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "6px",
              }}
            >

              <button
                disabled={
                  currentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.max(
                        page - 1,
                        1
                      )
                  )
                }
                style={{
                  width: "34px",
                  height: "34px",
                  border:
                    "1px solid var(--border)",
                  borderRadius:
                    "7px",
                  background:
                    "var(--surface)",
                  color:
                    "var(--text-primary)",
                  cursor:
                    currentPage ===
                    1
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    currentPage ===
                    1
                      ? 0.5
                      : 1,
                }}
              >
                <ChevronLeft
                  size={16}
                />
              </button>

              <span
                style={{
                  padding:
                    "0 10px",
                  fontSize:
                    "13px",
                  color:
                    "var(--text-secondary)",
                }}
              >
                Page{" "}
                {
                  currentPage
                }{" "}
                of{" "}
                {totalPages}
              </span>

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                  )
                }
                style={{
                  width: "34px",
                  height: "34px",
                  border:
                    "1px solid var(--border)",
                  borderRadius:
                    "7px",
                  background:
                    "var(--surface)",
                  color:
                    "var(--text-primary)",
                  cursor:
                    currentPage ===
                    totalPages
                      ? "not-allowed"
                      : "pointer",
                  opacity:
                    currentPage ===
                    totalPages
                      ? 0.5
                      : 1,
                }}
              >
                <ChevronRight
                  size={16}
                />
              </button>

            </div>

          </div>

        )}

      </section>

    </>
  );
};

export default Orders;