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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatCurrency = (value: number | string) => {
    return `LKR ${Number(value || 0).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div className="dashboard">

      {/* PAGE HEADER */}

      <div className="admin-header">
        <div>
          <p className="panel-kicker">
            TRANSACTIONS
          </p>

          <h1>Transactions</h1>

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

      {/* ERROR */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* TRANSACTIONS TABLE */}

      <section className="panel">

        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              PAYMENT RECORDS
            </span>

            <h2>All Transactions</h2>

            <p>
              Recent payment transaction records
            </p>
          </div>
        </div>

        <div className="panel-body">

          {loading ? (
            <p
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Loading transactions...
            </p>
          ) : transactions.length === 0 ? (
            <p
              style={{
                color: "var(--text-secondary)",
              }}
            >
              No transactions found.
            </p>
          ) : (
            <div className="admin-table-wrapper">

              <table className="admin-table">

                <thead>
                  <tr>
                    <th>Payment ID</th>
                    <th>Order ID</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Transaction Fee</th>
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

    </div>
  );
};

export default Transactions;