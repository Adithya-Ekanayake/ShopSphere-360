const pool = require("../config/db");

// ==========================================================
// SALES REPORT
// ==========================================================

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        DATE_FORMAT(OrderDate, '%Y-%m-%d') AS ReportDate,
        COUNT(DISTINCT OrderKey) AS TotalOrders,
        SUM(Quantity) AS UnitsSold,
        SUM(Revenue) AS Revenue,
        SUM(Profit) AS Profit
      FROM fact_sales
    `;

    const params = [];

    if (startDate && endDate) {
      query += `
        WHERE OrderDate >= ?
        AND OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
      `;

      params.push(startDate, endDate);
    }

    query += `
      GROUP BY DATE(OrderDate)
      ORDER BY ReportDate DESC
    `;

    const [rows] = await pool.query(
      query,
      params
    );

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Sales report error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message: "Failed to generate sales report",
    });
  }
};

// ==========================================================
// REVENUE & PROFIT REPORT
// ==========================================================

const getRevenueProfitReport = async (
  req,
  res
) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        SUM(Revenue) AS TotalRevenue,
        SUM(Cost) AS TotalCost,
        SUM(Profit) AS TotalProfit,
        CASE
          WHEN SUM(Revenue) > 0
          THEN (SUM(Profit) / SUM(Revenue)) * 100
          ELSE 0
        END AS ProfitMarginPercent
      FROM fact_sales
    `;

    const params = [];

    if (startDate && endDate) {
      query += `
        WHERE OrderDate >= ?
        AND OrderDate < DATE_ADD(?, INTERVAL 1 DAY)
      `;

      params.push(startDate, endDate);
    }

    const [rows] = await pool.query(
      query,
      params
    );

    res.json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error(
      "Revenue profit report error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message:
        "Failed to generate revenue and profit report",
    });
  }
};

// ==========================================================
// CUSTOMER REPORT
// ==========================================================

const getCustomerReport = async (
  req,
  res
) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        c.CustomerID,
        CONCAT(
          c.FirstName,
          ' ',
          c.LastName
        ) AS CustomerName,
        c.Gender,
        c.Age,
        c.CustomerSegment,
        c.AcquisitionChannel,
        c.City,
        c.Country,

        COUNT(DISTINCT f.OrderKey)
          AS TotalOrders,

        COALESCE(
          SUM(f.Revenue),
          0
        ) AS TotalRevenue,

        COALESCE(
          SUM(f.Profit),
          0
        ) AS TotalProfit,

        CASE
          WHEN SUM(f.Revenue) > 0
          THEN
            (
              SUM(f.Profit)
              /
              SUM(f.Revenue)
            ) * 100
          ELSE 0
        END AS ProfitMarginPercent,

        CASE
          WHEN COUNT(DISTINCT f.OrderKey) > 0
          THEN
            SUM(f.Revenue)
            /
            COUNT(DISTINCT f.OrderKey)
          ELSE 0
        END AS AverageOrderValue

      FROM dim_customer c

      LEFT JOIN fact_sales f
        ON c.CustomerKey = f.CustomerKey
    `;

    const params = [];

    if (startDate && endDate) {
      query += `
        AND f.OrderDate >= ?
        AND f.OrderDate < DATE_ADD(
          ?,
          INTERVAL 1 DAY
        )
      `;

      params.push(startDate, endDate);
    }

    query += `
      GROUP BY
        c.CustomerKey,
        c.CustomerID,
        c.FirstName,
        c.LastName,
        c.Gender,
        c.Age,
        c.CustomerSegment,
        c.AcquisitionChannel,
        c.City,
        c.Country

      HAVING TotalOrders > 0

      ORDER BY TotalRevenue DESC
    `;

    const [rows] = await pool.query(
      query,
      params
    );

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Customer report error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message:
        "Failed to generate customer report",
    });
  }
};

// ==========================================================
// PRODUCT REPORT
// ==========================================================

const getProductReport = async (
  req,
  res
) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand,

        COALESCE(
          SUM(f.Quantity),
          0
        ) AS UnitsSold,

        COALESCE(
          SUM(f.Revenue),
          0
        ) AS TotalRevenue,

        COALESCE(
          SUM(f.Cost),
          0
        ) AS TotalCost,

        COALESCE(
          SUM(f.Profit),
          0
        ) AS TotalProfit,

        CASE
          WHEN SUM(f.Revenue) > 0
          THEN
            (
              SUM(f.Profit)
              /
              SUM(f.Revenue)
            ) * 100
          ELSE 0
        END AS ProfitMarginPercent,

        COUNT(
          DISTINCT f.OrderKey
        ) AS TotalOrders

      FROM dim_product p

      LEFT JOIN fact_sales f
        ON p.ProductKey = f.ProductKey
    `;

    const params = [];

    if (startDate && endDate) {
      query += `
        AND f.OrderDate >= ?
        AND f.OrderDate < DATE_ADD(
          ?,
          INTERVAL 1 DAY
        )
      `;

      params.push(startDate, endDate);
    }

    query += `
      GROUP BY
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand

      HAVING TotalOrders > 0

      ORDER BY TotalRevenue DESC
    `;

    const [rows] = await pool.query(
      query,
      params
    );

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Product report error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message:
        "Failed to generate product report",
    });
  }
};

// ==========================================================
// TRANSACTION REPORT
// ==========================================================

const getTransactionReport = async (
  req,
  res
) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT
        f.OrderKey,
        f.OrderDate,

        c.CustomerID,

        CONCAT(
          c.FirstName,
          ' ',
          c.LastName
        ) AS CustomerName,

        p.ProductID,
        p.ProductName,

        f.Quantity,
        f.UnitPrice,

        f.Revenue,
        f.Cost,
        f.Profit

      FROM fact_sales f

      LEFT JOIN dim_customer c
        ON f.CustomerKey =
           c.CustomerKey

      LEFT JOIN dim_product p
        ON f.ProductKey =
           p.ProductKey
    `;

    const params = [];

    if (startDate && endDate) {
      query += `
        WHERE f.OrderDate >= ?
        AND f.OrderDate < DATE_ADD(
          ?,
          INTERVAL 1 DAY
        )
      `;

      params.push(startDate, endDate);
    }

    query += `
      ORDER BY
        f.OrderDate DESC,
        f.OrderKey DESC
    `;

    const [rows] = await pool.query(
      query,
      params
    );

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Transaction report error:",
      error.message
    );

    res.status(500).json({
      status: "error",
      message:
        "Failed to generate transaction report",
    });
  }
};

// ==========================================================
// EXPORT
// ==========================================================

module.exports = {
  getSalesReport,
  getRevenueProfitReport,
  getCustomerReport,
  getProductReport,
  getTransactionReport,
};