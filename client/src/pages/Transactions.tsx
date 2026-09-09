import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Package,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import transactionsService from "../services/transactionsService";

import "../styles/dashboard.css";
import "../styles/admin.css";

interface Transaction {
  PaymentKey: number;
  OrderKey: number;
  OrderID: string;
  DateKey: number;
  TransactionDate: string;
  PaymentMethod: string;
  PaymentAmount: number | string;
  PaymentStatus: string;
  TransactionFee: number | string;
}

const Transactions = () => {
  /* =========================================================
     DARK MODE
     ========================================================= */

  const [darkMode] = useState<boolean>(() => {
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

  const [transactions, setTransactions] = useState<Transaction[]>(
    []
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.OrderID?.toLowerCase().includes(query) ||
        transaction.PaymentMethod?.toLowerCase().includes(query) ||
        transaction.PaymentStatus?.toLowerCase().includes(query) ||
        String(transaction.PaymentKey).includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        transaction.PaymentStatus?.toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter]);

  const summary = useMemo(() => {
    const total = filteredTransactions.length;
    const completed = filteredTransactions.filter(
      (transaction) =>
        transaction.PaymentStatus?.toLowerCase() === "completed"
    ).length;
    const pending = filteredTransactions.filter(
      (transaction) =>
        transaction.PaymentStatus?.toLowerCase() === "pending"
    ).length;
    const cancelled = filteredTransactions.filter(
      (transaction) =>
        ["cancelled", "failed"].includes(
          transaction.PaymentStatus?.toLowerCase()
        )
    ).length;

    return {
      total,
      completed,
      pending,
      cancelled,
    };
  }, [filteredTransactions]);

  /* =========================================================
     LOAD TRANSACTIONS
     ========================================================= */

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await transactionsService.getTransactions();

        setTransactions(data);
      } catch (err) {
        console.error(
          "Failed to load transactions:",
          err
        );

        setError("Unable to load transactions.");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  /* =========================================================
     FORMAT CURRENCY
     ========================================================= */

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

  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (date: string) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="admin-header">

        <div>
          <p className="panel-kicker">
            SALES MANAGEMENT
          </p>

          <h1>
            Transactions
          </h1>

          <p
            style={{
              marginTop: "5px",
              color: "var(--text-secondary)",
              fontSize: "14px",
            }}
          >
            View and manage payment transactions.
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
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Package size={20} />
          </div>

          <div className="kpi-content">
            <span>Total Transactions</span>
            <strong>
              {summary.total.toLocaleString()}
            </strong>
            <small>All payment records</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <CheckCircle2 size={20} />
          </div>

          <div className="kpi-content">
            <span>Completed</span>
            <strong>
              {summary.completed.toLocaleString()}
            </strong>
            <small>Successful payments</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Clock3 size={20} />
          </div>

          <div className="kpi-content">
            <span>Pending</span>
            <strong>
              {summary.pending.toLocaleString()}
            </strong>
            <small>Awaiting completion</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <XCircle size={20} />
          </div>

          <div className="kpi-content">
            <span>Cancelled</span>
            <strong>
              {summary.cancelled.toLocaleString()}
            </strong>
            <small>Failed or cancelled</small>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRANSACTIONS TABLE
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
              PAYMENT RECORDS
            </span>

            <h2>
              All Transactions
            </h2>

            <p>
              Payment transaction records
            </p>
          </div>

        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            padding: "0 24px 20px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 300px",
            }}
          >
            <Search
              size={17}
              style={{
                position: "absolute",
                left: "13px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
              }}
            />

            <input
              type="text"
              placeholder="Search orders, methods or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                height: "42px",
                padding: "0 14px 0 40px",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: "42px",
              padding: "0 35px 0 13px",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              background: "var(--surface)",
              color: "var(--text)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="panel-body">

          {/* =================================================
              LOADING
              ================================================= */}

          {loading ? (

            <div className="chart-status">
              <p>
                Loading transactions...
              </p>
            </div>

          ) : filteredTransactions.length === 0 ? (

            /* ===============================================
               EMPTY STATE
               =============================================== */

            <div className="chart-status">
              <p>
                No transactions found.
              </p>
            </div>

          ) : (

            /* ===============================================
               TABLE
               =============================================== */

            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>

                  <tr>
                    <th>
                      Payment ID
                    </th>

                    <th>
                      Order ID
                    </th>

                    <th>
                      Transaction Date
                    </th>

                    <th>
                      Payment Method
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Transaction Fee
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {filteredTransactions.map(
                    (transaction) => (

                      <tr
                        key={
                          transaction.PaymentKey
                        }
                      >

                        <td>
                          {transaction.PaymentKey}
                        </td>

                        <td>
                          {transaction.OrderID}
                        </td>

                        <td>
                          {formatDate(
                            transaction.TransactionDate
                          )}
                        </td>

                        <td>
                          {transaction.PaymentMethod}
                        </td>

                        <td>
                          {formatCurrency(
                            transaction.PaymentAmount
                          )}
                        </td>

                        <td>
                          {transaction.PaymentStatus}
                        </td>

                        <td>
                          {formatCurrency(
                            transaction.TransactionFee
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

    </>
  );
};

export default Transactions;