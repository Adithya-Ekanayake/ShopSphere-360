const pool = require("../config/db");

// Dashboard KPIs
const getDashboardKPIs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        COUNT(DISTINCT o.OrderKey) AS TotalOrders,
        COUNT(DISTINCT o.CustomerKey) AS TotalCustomers,
        ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
        ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
        ROUND(
          SUM(oi.ProfitAmount) /
          NULLIF(SUM(oi.SalesAmount), 0) * 100,
          2
        ) AS ProfitMarginPercent,
        ROUND(
          SUM(oi.SalesAmount) /
          NULLIF(COUNT(DISTINCT o.OrderKey), 0),
          2
        ) AS AverageOrderValue
      FROM fact_orders o
      JOIN fact_order_items oi
        ON o.OrderKey = oi.OrderKey
      WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
    `);

    res.json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error("Dashboard KPI error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard KPIs",
    });
  }
};

// Monthly Sales
const getMonthlySales = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
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

// Customer Analytics
const getCustomerAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        CustomerKey,
        CustomerID,
        CustomerName,
        Gender,
        Age,
        CustomerSegment,
        AcquisitionChannel,
        City,
        Country,
        TotalOrders,
        TotalUnitsPurchased,
        TotalRevenue,
        TotalProfit,
        ProfitMarginPercent,
        AverageOrderValue,
        PurchaseBehavior
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

// Product Analytics
const getProductAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_product_analytics
      ORDER BY TotalProfit DESC
    `);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Product analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch product analytics",
    });
  }
};

// Marketing Analytics
const getMarketingAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        MarketingKey,
        CampaignName,
        ChannelName,
        FullDate,
        Year,
        Month,
        MonthName,
        Impressions,
        Clicks,
        ROUND(
          Clicks / NULLIF(Impressions, 0) * 100,
          2
        ) AS CTRPercent,
        Leads,
        ROUND(
          Leads / NULLIF(Clicks, 0) * 100,
          2
        ) AS LeadConversionRatePercent,
        Conversions,
        ROUND(
          Conversions / NULLIF(Leads, 0) * 100,
          2
        ) AS ConversionRatePercent,
        Spend,
        AttributedRevenue,
        ROUND(
          AttributedRevenue / NULLIF(Spend, 0),
          2
        ) AS ROAS,
        ROUND(
          Spend / NULLIF(Clicks, 0),
          2
        ) AS CostPerClick,
        ROUND(
          Spend / NULLIF(Leads, 0),
          2
        ) AS CostPerLead,
        ROUND(
          Spend / NULLIF(Conversions, 0),
          2
        ) AS CostPerConversion
      FROM fact_marketing m
      JOIN dim_campaign c
        ON m.CampaignKey = c.CampaignKey
      JOIN dim_channel ch
        ON m.ChannelKey = ch.ChannelKey
      JOIN dim_date d
        ON m.DateKey = d.DateKey
      ORDER BY AttributedRevenue DESC
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

// Returns Analytics
const getReturnsAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM vw_returns_analytics
      ORDER BY RefundAmount DESC
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

// Support Analytics
const getSupportAnalytics = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        IssueType,
        Priority,
        COUNT(*) AS TotalTickets,
        ROUND(
          AVG(ResolutionTimeHours),
          2
        ) AS AverageResolutionTimeHours,
        ROUND(
          AVG(SatisfactionScore),
          2
        ) AS AverageSatisfactionScore,
        SUM(
          CASE
            WHEN Status = 'Resolved' THEN 1
            ELSE 0
          END
        ) AS ResolvedTickets,
        SUM(
          CASE
            WHEN Status <> 'Resolved' THEN 1
            ELSE 0
          END
        ) AS UnresolvedTickets,
        ROUND(
          SUM(
            CASE
              WHEN Status = 'Resolved' THEN 1
              ELSE 0
            END
          ) / COUNT(*) * 100,
          2
        ) AS ResolutionRatePercent
      FROM fact_support
      GROUP BY
        IssueType,
        Priority
      ORDER BY
        AverageSatisfactionScore ASC,
        AverageResolutionTimeHours DESC
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

module.exports = {
  getDashboardKPIs,
  getMonthlySales,
  getCustomerAnalytics,
  getProductAnalytics,
  getMarketingAnalytics,
  getReturnsAnalytics,
  getSupportAnalytics,
};