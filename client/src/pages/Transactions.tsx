import { useEffect, useState } from "react";
import transactionsService from "../services/transactionsService";

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            TRANSACTIONS
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
            View and monitor payment transactions.
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

          ) : transactions.length === 0 ? (

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

                  {transactions.map(
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