const pool = require("../config/db");

// ==========================================
// TRANSACTION KPIs
// ==========================================

const getTransactionKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS TotalTransactions,

        COALESCE(
          SUM(PaymentAmount),
          0
        ) AS TotalPaymentAmount,

        COALESCE(
          SUM(TransactionFee),
          0
        ) AS TotalTransactionFees,

        COALESCE(
          AVG(PaymentAmount),
          0
        ) AS AverageTransactionValue

      FROM fact_payments
    `);

    res.json({
      status: "success",
      data: {
        TotalTransactions: Number(
          rows[0].TotalTransactions
        ),

        TotalPaymentAmount: Number(
          rows[0].TotalPaymentAmount
        ),

        TotalTransactionFees: Number(
          rows[0].TotalTransactionFees
        ),

        AverageTransactionValue: Number(
          rows[0].AverageTransactionValue
        ),
      },
    });
  } catch (error) {
    console.error(
      "Transaction KPI error:",
      error
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch transaction KPIs",
    });
  }
};


// ==========================================
// ALL TRANSACTIONS
// ==========================================

const getTransactions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        fp.PaymentKey,
        fp.OrderKey,

        fo.OrderID,

        fp.DateKey,

        dd.FullDate AS TransactionDate,

        fp.PaymentMethod,
        fp.PaymentAmount,
        fp.PaymentStatus,
        fp.TransactionFee

      FROM fact_payments fp

      LEFT JOIN fact_orders fo
        ON fp.OrderKey = fo.OrderKey

      LEFT JOIN dim_date dd
        ON fp.DateKey = dd.DateKey

      ORDER BY
        fp.PaymentKey DESC

      LIMIT 500
    `);

    console.log(
      `Transactions fetched: ${rows.length}`
    );

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Transactions error:",
      error
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch transactions",
    });
  }
};


// ==========================================
// TRANSACTIONS BY PAYMENT METHOD
// ==========================================

const getTransactionsByMethod = async (
  req,
  res
) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        PaymentMethod,

        COUNT(*) AS TotalTransactions,

        COALESCE(
          SUM(PaymentAmount),
          0
        ) AS TotalAmount

      FROM fact_payments

      GROUP BY
        PaymentMethod

      ORDER BY
        TotalAmount DESC
    `);

    res.json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error(
      "Transaction method error:",
      error
    );

    res.status(500).json({
      status: "error",
      message: "Failed to fetch payment method data",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getTransactionKPIs,
  getTransactions,
  getTransactionsByMethod,
};