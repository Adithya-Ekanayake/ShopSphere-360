const pool = require("../config/db");

// ==========================================
// SALES KPIs
// ==========================================

const getSalesKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) AS TotalOrders,
        COALESCE(SUM(OrderTotal), 0) AS TotalRevenue,
        COALESCE(SUM(OrderTotal - DiscountAmount - TaxAmount - ShippingAmount), 0) AS NetSales,
        COALESCE(AVG(OrderTotal), 0) AS AverageOrderValue
      FROM fact_orders
    `);

    const [profitRows] = await pool.query(`
      SELECT
        COALESCE(SUM(foi.ProfitAmount), 0) AS TotalProfit
      FROM fact_order_items foi
    `);

    const totalRevenue = Number(rows[0].TotalRevenue);
    const totalProfit = Number(profitRows[0].TotalProfit);

    res.json({
      status: "success",
      data: {
        TotalOrders: Number(rows[0].TotalOrders),
        TotalRevenue: totalRevenue,
        TotalProfit: totalProfit,
        AverageOrderValue: Number(rows[0].AverageOrderValue),
        ProfitMarginPercent:
          totalRevenue > 0
            ? Number(((totalProfit / totalRevenue) * 100).toFixed(2))
            : 0,
      },
    });
  } catch (error) {
    console.error("Sales KPI error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch sales KPIs",
    });
  }
};


// ==========================================
// MONTHLY SALES
// ==========================================

const getMonthlySales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        dd.Year,
        dd.Month,
        dd.MonthName,
        COUNT(DISTINCT fo.OrderKey) AS TotalOrders,
        COALESCE(SUM(fo.OrderTotal), 0) AS TotalRevenue,
        COALESCE(SUM(foi.ProfitAmount), 0) AS TotalProfit
      FROM fact_orders fo
      INNER JOIN dim_date dd
        ON fo.DateKey = dd.DateKey
      LEFT JOIN fact_order_items foi
        ON fo.OrderKey = foi.OrderKey
      GROUP BY
        dd.Year,
        dd.Month,
        dd.MonthName
      ORDER BY
        dd.Year,
        dd.Month
    `);

    res.json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Monthly sales error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch monthly sales",
    });
  }
};


// ==========================================
// SALES BY CHANNEL
// ==========================================

const getSalesByChannel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        dc.ChannelName,
        COUNT(fo.OrderKey) AS TotalOrders,
        COALESCE(SUM(fo.OrderTotal), 0) AS TotalRevenue
      FROM fact_orders fo
      INNER JOIN dim_channel dc
        ON fo.ChannelKey = dc.ChannelKey
      GROUP BY
        dc.ChannelKey,
        dc.ChannelName
      ORDER BY
        TotalRevenue DESC
    `);

    res.json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Sales channel error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch channel sales",
    });
  }
};


// ==========================================
// RECENT ORDERS
// ==========================================

const getRecentOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        fo.OrderKey,
        fo.OrderID,

        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,

        dd.FullDate AS OrderDate,

        dc.ChannelName,

        dl.City,
        dl.Region,
        dl.Country,

        fo.OrderStatus,
        fo.PaymentStatus,
        fo.ShippingStatus,

        fo.OrderTotal,
        fo.DiscountAmount,
        fo.TaxAmount,
        fo.ShippingAmount

      FROM fact_orders fo

      INNER JOIN dim_customer c
        ON fo.CustomerKey = c.CustomerKey

      INNER JOIN dim_date dd
        ON fo.DateKey = dd.DateKey

      INNER JOIN dim_channel dc
        ON fo.ChannelKey = dc.ChannelKey

      INNER JOIN dim_location dl
        ON fo.LocationKey = dl.LocationKey

      ORDER BY
        fo.OrderKey DESC

      LIMIT 50
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Recent orders error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch recent orders",
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  getSalesKPIs,
  getMonthlySales,
  getSalesByChannel,
  getRecentOrders,
};