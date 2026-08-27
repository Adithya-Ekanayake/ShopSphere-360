const pool = require("../config/db");
const { buildFilterClause, getFilterOptions: getFilterOptionsUtil, buildMonthlySalesQuery } = require("../utils/filterHelper");

const salesFilters = {
  relevant: ["startDate", "endDate", "productKey", "segment", "channelKey", "locationKey", "status"],
// CUSTOMER RFM SEGMENTATION
};

const handleFilterError = (error, res) => {
  if (!error?.message?.startsWith("Invalid")) return false;

  res.status(400).json({ status: "error", message: error.message });
  return true;
};

// ==========================================
// KPI ANALYTICS
// ==========================================

const getKPIs = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, salesFilters);
    const [rows] = await pool.query(`
      SELECT
        COUNT(DISTINCT o.OrderKey) AS TotalOrders,
        SUM(oi.Quantity) AS TotalUnitsSold,
        ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
        ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
        ROUND(SUM(oi.ProfitAmount) / NULLIF(SUM(oi.SalesAmount), 0) * 100, 2) AS ProfitMarginPercent,
        ROUND(SUM(oi.SalesAmount) / NULLIF(COUNT(DISTINCT o.OrderKey), 0), 2) AS AverageOrderValue,
        COUNT(DISTINCT c.CustomerKey) AS TotalCustomers
      FROM dim_customer c
      JOIN fact_orders o ON c.CustomerKey = o.CustomerKey
      JOIN fact_order_items oi ON o.OrderKey = oi.OrderKey
      JOIN dim_date d ON o.DateKey = d.DateKey
      JOIN dim_product p ON oi.ProductKey = p.ProductKey
      JOIN dim_channel ch ON o.ChannelKey = ch.ChannelKey
      JOIN dim_location l ON o.LocationKey = l.LocationKey
      WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
      ${whereClause ? `AND ${whereClause.slice(6)}` : ""}
    `, params);

    res.json({
      status: "success",
      data: {
        ...(rows[0] || {}),
      },
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("KPI analytics error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Failed to fetch KPI analytics",
    });
  }
};

// ==========================================
// TOP PRODUCTS ANALYTICS
// ==========================================

const getTopProducts = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, salesFilters);
    const [rows] = await pool.query(`
      SELECT
        p.ProductKey, p.ProductID, p.ProductName, p.Category, p.Subcategory, p.Brand,
        SUM(oi.Quantity) AS UnitsSold,
        ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
        ROUND(SUM(oi.CostAmount), 2) AS TotalCost,
        ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
        ROUND(SUM(oi.ProfitAmount) / NULLIF(SUM(oi.SalesAmount), 0) * 100, 2) AS ProfitMarginPercent,
        COUNT(DISTINCT o.OrderKey) AS TotalOrders,
        ROUND(SUM(oi.SalesAmount) / NULLIF(SUM(oi.Quantity), 0), 2) AS AverageSellingPrice,
        COALESCE(SUM(r.QuantityReturned), 0) AS UnitsReturned,
        ROUND(COALESCE(SUM(r.RefundAmount), 0), 2) AS TotalRefundAmount,
        ROUND(COALESCE(SUM(r.QuantityReturned), 0) / NULLIF(SUM(oi.Quantity), 0) * 100, 2) AS ReturnRatePercent
      FROM dim_product p
      JOIN fact_order_items oi ON p.ProductKey = oi.ProductKey
      JOIN fact_orders o ON oi.OrderKey = o.OrderKey
      JOIN dim_date d ON o.DateKey = d.DateKey
      JOIN dim_customer c ON o.CustomerKey = c.CustomerKey
      JOIN dim_channel ch ON o.ChannelKey = ch.ChannelKey
      JOIN dim_location l ON o.LocationKey = l.LocationKey
      LEFT JOIN (
        SELECT ProductKey, OrderKey, SUM(QuantityReturned) AS QuantityReturned, SUM(RefundAmount) AS RefundAmount
        FROM fact_returns
        GROUP BY ProductKey, OrderKey
      ) r ON oi.ProductKey = r.ProductKey AND oi.OrderKey = r.OrderKey
      ${whereClause}
      GROUP BY p.ProductKey, p.ProductID, p.ProductName, p.Category, p.Subcategory, p.Brand
      ORDER BY TotalRevenue DESC
      LIMIT 10
    `, params);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
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
    const { whereClause, params } = buildFilterClause(req.query, salesFilters);
    const [rows] = await pool.query(`
      SELECT
        c.CustomerKey, c.CustomerID, CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
        c.Gender, c.Age, c.CustomerSegment, c.AcquisitionChannel, c.City, c.Country,
        COUNT(DISTINCT o.OrderKey) AS TotalOrders,
        SUM(oi.Quantity) AS TotalUnitsPurchased,
        ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
        ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
        ROUND(SUM(oi.ProfitAmount) / NULLIF(SUM(oi.SalesAmount), 0) * 100, 2) AS ProfitMarginPercent,
        ROUND(SUM(oi.SalesAmount) / NULLIF(COUNT(DISTINCT o.OrderKey), 0), 2) AS AverageOrderValue
      FROM dim_customer c
      JOIN fact_orders o ON c.CustomerKey = o.CustomerKey
      JOIN fact_order_items oi ON o.OrderKey = oi.OrderKey
      JOIN dim_date d ON o.DateKey = d.DateKey
      JOIN dim_product p ON oi.ProductKey = p.ProductKey
      JOIN dim_channel ch ON o.ChannelKey = ch.ChannelKey
      JOIN dim_location l ON o.LocationKey = l.LocationKey
      WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
      ${whereClause ? `AND ${whereClause.slice(6)}` : ""}
      GROUP BY c.CustomerKey, c.CustomerID, c.FirstName, c.LastName, c.Gender, c.Age,
        c.CustomerSegment, c.AcquisitionChannel, c.City, c.Country
      ORDER BY TotalRevenue DESC
    `, params);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
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
    const { whereClause, params } = buildFilterClause(req.query, {
      relevant: ["startDate", "endDate", "channelKey"],
    });
    const [rows] = await pool.query(`
      SELECT
        m.MarketingKey, m.CampaignKey, c.CampaignName, c.CampaignType,
        m.DateKey, d.FullDate, d.Year, d.Month, d.MonthName,
        m.ChannelKey, ch.ChannelName, m.Impressions, m.Clicks, m.Leads, m.Conversions,
        m.Spend, m.AttributedRevenue,
        ROUND(m.Clicks / NULLIF(m.Impressions, 0) * 100, 2) AS CTRPercent,
        ROUND(m.Conversions / NULLIF(m.Clicks, 0) * 100, 2) AS ConversionRatePercent,
        ROUND(m.Spend / NULLIF(m.Conversions, 0), 2) AS CostPerConversion,
        ROUND(m.AttributedRevenue / NULLIF(m.Spend, 0), 2) AS ROAS
      FROM fact_marketing m
      JOIN dim_campaign c ON m.CampaignKey = c.CampaignKey
      JOIN dim_date d ON m.DateKey = d.DateKey
      JOIN dim_channel ch ON m.ChannelKey = ch.ChannelKey
      ${whereClause}
      ORDER BY m.AttributedRevenue DESC
    `, params);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
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
    const { whereClause, params } = buildFilterClause(req.query, salesFilters);
    const [rows] = await pool.query(`
      SELECT
        r.ReturnReason,
        COUNT(DISTINCT r.ReturnKey) AS TotalReturns,
        SUM(r.QuantityReturned) AS QuantityReturned,
        ROUND(SUM(r.RefundAmount), 2) AS RefundAmount,
        ROUND(
          SUM(r.QuantityReturned) / NULLIF(SUM(oi.Quantity), 0) * 100,
          2
        ) AS ReturnRatePercent
      FROM fact_returns r
      JOIN fact_orders o ON r.OrderKey = o.OrderKey
      JOIN fact_order_items oi
        ON r.OrderKey = oi.OrderKey
        AND r.ProductKey = oi.ProductKey
      JOIN dim_date d ON r.DateKey = d.DateKey
      JOIN dim_channel ch ON o.ChannelKey = ch.ChannelKey
      JOIN dim_location l ON o.LocationKey = l.LocationKey
      ${whereClause}
      GROUP BY r.ReturnReason
      ORDER BY RefundAmount DESC
    `, params);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
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
    const { whereClause, params } = buildFilterClause(req.query, {
      statusColumn: "s.Status",
      relevant: ["startDate", "endDate", "segment", "status"],
    });
    const [rows] = await pool.query(`
      SELECT
        s.SupportKey, s.TicketID, s.CustomerKey,
        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
        s.DateKey, d.FullDate, d.Year, d.Month, d.MonthName,
        s.IssueType, s.Priority, s.ResolutionTimeHours, s.SatisfactionScore, s.Status,
        CASE
          WHEN s.ResolutionTimeHours <= 4 THEN 'Fast'
          WHEN s.ResolutionTimeHours <= 24 THEN 'Normal'
          WHEN s.ResolutionTimeHours <= 72 THEN 'Slow'
          ELSE 'Very Slow'
        END AS ResolutionSpeed,
        CASE
          WHEN s.SatisfactionScore >= 4 THEN 'Satisfied'
          WHEN s.SatisfactionScore >= 3 THEN 'Neutral'
          ELSE 'Dissatisfied'
        END AS SatisfactionCategory
      FROM fact_support s
      JOIN dim_customer c ON s.CustomerKey = c.CustomerKey
      JOIN dim_date d ON s.DateKey = d.DateKey
      ${whereClause}
      ORDER BY s.DateKey, s.SupportKey
    `, params);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
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

// ==========================================
// FILTER OPTIONS
// Returns distinct values for all filter dimensions
// ==========================================

const getFilterOptionsCtrl = async (req, res) => {
  try {
    const options = await getFilterOptionsUtil(pool);
    res.json({ status: "success", data: options });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Filter options error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch filter options",
    });
  }
};

// ==========================================
// MONTHLY SALES WITH FILTERS
// ==========================================

const getMonthlySales = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query);
    const query = buildMonthlySalesQuery(whereClause);
    const [rows] = await pool.query(query, params);

    res.json({
      status: "success",
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Monthly sales error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch monthly sales",
    });
  }
};

const getCustomerRfm = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, {
      dateColumn: "r.LastPurchaseDate",
      segmentColumn: "r.CustomerSegment",
      relevant: ["startDate", "endDate", "segment"],
    });
    const [rows] = await pool.query(`
      SELECT r.*
      FROM vw_customer_rfm r
      ${whereClause}
      ORDER BY r.RFMScore DESC, r.MonetaryValue DESC
    `, params);

    res.json({ status: "success", count: rows.length, data: rows });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Customer RFM error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch customer RFM analytics" });
  }
};

const getCustomerClv = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, {
      dateColumn: "v.LastPurchaseDate",
      segmentColumn: "v.CustomerSegment",
      relevant: ["startDate", "endDate", "segment"],
    });
    const [rows] = await pool.query(`
      SELECT v.* FROM vw_customer_clv v
      ${whereClause}
      ORDER BY v.PredictedCLV DESC
    `, params);
    res.json({ status: "success", count: rows.length, data: rows });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Customer CLV error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch customer CLV analytics" });
  }
};

const getCustomerRetention = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, {
      dateColumn: "v.PeriodStart",
      segmentColumn: "v.CustomerSegment",
      relevant: ["startDate", "endDate", "segment"],
    });
    const [rows] = await pool.query(`
      SELECT v.* FROM vw_customer_retention v
      ${whereClause}
      ORDER BY v.PeriodStart, v.CustomerSegment
    `, params);
    res.json({ status: "success", count: rows.length, data: rows });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Customer retention error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch customer retention analytics" });
  }
};

const getProductProfitability = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, {
      productColumn: "v.ProductKey",
      relevant: ["productKey"],
    });
    const [rows] = await pool.query(`
      SELECT v.* FROM vw_product_profitability v
      ${whereClause}
      ORDER BY v.TotalProfit DESC
    `, params);
    res.json({ status: "success", count: rows.length, data: rows });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Product profitability error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch product profitability analytics" });
  }
};

const getCustomerCohorts = async (req, res) => {
  try {
    const { whereClause, params } = buildFilterClause(req.query, {
      dateColumn: "v.CohortMonth",
      segmentColumn: "v.CustomerSegment",
      relevant: ["startDate", "endDate", "segment"],
    });
    const [rows] = await pool.query(`
      SELECT v.* FROM vw_customer_cohorts v
      ${whereClause}
      ORDER BY v.CohortMonth, v.MonthsSinceAcquisition
    `, params);
    res.json({ status: "success", count: rows.length, data: rows });
  } catch (error) {
    if (handleFilterError(error, res)) return;
    console.error("Customer cohorts error:", error.message);
    res.status(500).json({ status: "error", message: "Failed to fetch customer cohort analytics" });
  }
};

module.exports = {
  getKPIs,
  getMonthlySales,
  getTopProducts,
  getCustomerAnalytics,
  getMarketingAnalytics,
  getReturnsAnalytics,
  getSupportAnalytics,
  getFilterOptions: getFilterOptionsCtrl,
  getCustomerRfm,
  getCustomerClv,
  getCustomerRetention,
  getProductProfitability,
  getCustomerCohorts,
};