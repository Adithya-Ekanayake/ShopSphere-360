const pool = require("../config/db");

// ==========================================
// KPI ANALYTICS
// ==========================================

const getKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_sales_kpis
      LIMIT 1
    `);

    const [customerRows] = await pool.query(`
      SELECT COUNT(*) AS TotalCustomers
      FROM dim_customer
    `);

    res.json({
      status: "success",
      data: {
        ...rows[0],
        TotalCustomers: Number(customerRows[0].TotalCustomers),
      },
    });
  } catch (error) {
    console.error("KPI analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch KPI analytics",
    });
  }
};

// ==========================================
// MONTHLY SALES ANALYTICS
// ==========================================

const getMonthlySales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        Year,
        Month,
        MonthName,
        TotalOrders,
        UnitsSold,
        Revenue AS TotalRevenue,
        Profit AS TotalProfit,
        ProfitMarginPercent,
        AverageOrderValue
      FROM vw_monthly_sales
      ORDER BY Year, Month
    `);

    res.json({
      status: "success",
      count: rows.length,
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
// TOP PRODUCTS ANALYTICS
// ==========================================

const getTopProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        ProductKey,
        ProductID,
        ProductName,
        Category,
        Subcategory,
        Brand,
        UnitsSold,
        TotalRevenue,
        TotalCost,
        TotalProfit,
        ProfitMarginPercent,
        TotalOrders,
        AverageSellingPrice,
        UnitsReturned,
        TotalRefundAmount,
        ReturnRatePercent
      FROM vw_product_analytics
      ORDER BY TotalRevenue DESC
      LIMIT 10
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Top products error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch top products",
    });
  }
};

// ==========================================
// CUSTOMER ANALYTICS
// ==========================================

const getCustomerAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_customer_analytics
      ORDER BY TotalRevenue DESC
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Customer analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch customer analytics",
    });
  }
};

// ==========================================
// MARKETING ANALYTICS
// ==========================================

const getMarketingAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_marketing_analytics
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Marketing analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch marketing analytics",
    });
  }
};

// ==========================================
// RETURNS ANALYTICS
// ==========================================

const getReturnsAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_returns_analytics
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Returns analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch returns analytics",
    });
  }
};

// ==========================================
// SUPPORT ANALYTICS
// ==========================================

const getSupportAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_support_analytics
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Support analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch support analytics",
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
  getKPIs,
  getMonthlySales,
  getTopProducts,
  getCustomerAnalytics,
  getMarketingAnalytics,
  getReturnsAnalytics,
  getSupportAnalytics,
};