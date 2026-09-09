const pool = require("../config/db");

const ensurePaymentSeedData = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM fact_payments"
  );

  if (Number(rows[0].total) > 0) {
    return;
  }

  await pool.query(`
    INSERT INTO fact_payments (
      OrderKey,
      DateKey,
      PaymentMethod,
      PaymentAmount,
      PaymentStatus,
      TransactionFee
    )
    SELECT
      fo.OrderKey,
      fo.DateKey,
      CASE MOD(fo.OrderKey, 4)
        WHEN 0 THEN 'Credit Card'
        WHEN 1 THEN 'Debit Card'
        WHEN 2 THEN 'Digital Wallet'
        ELSE 'Bank Transfer'
      END AS PaymentMethod,
      ROUND(
        fo.OrderTotal * CASE MOD(fo.OrderKey, 5)
          WHEN 0 THEN 0.92
          WHEN 1 THEN 0.96
          WHEN 2 THEN 0.98
          ELSE 1
        END,
        2
      ) AS PaymentAmount,
      CASE
        WHEN fo.PaymentStatus = 'Paid' THEN 'Completed'
        WHEN fo.PaymentStatus = 'Pending' THEN 'Pending'
        ELSE 'Failed'
      END AS PaymentStatus,
      ROUND(fo.OrderTotal * 0.0125, 2) AS TransactionFee
    FROM fact_orders fo
    ORDER BY fo.OrderKey
  `);
};

// ==========================================
// TRANSACTION KPIs
// ==========================================

const getTransactionKPIs = async (req, res) => {
  try {
    await ensurePaymentSeedData();

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
    await ensurePaymentSeedData();

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
    await ensurePaymentSeedData();

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