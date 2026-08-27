const pool = require("../config/db");

// ==========================================
// REVENUE FORECAST
// Returns historical actuals + forecasted values for monthly revenue
// ==========================================
const getRevenueForecast = async (req, res) => {
  try {
    // Fetch historical actuals (last 24 months for context)
    const [actuals] = await pool.query(`
      SELECT 
        Year,
        Month,
        MonthName,
        Revenue AS ActualValue,
        NULL AS PredictedValue,
        NULL AS ConfidenceLower,
        NULL AS ConfidenceUpper,
        'actual' AS DataType
      FROM vw_monthly_sales
      ORDER BY Year, Month
    `);

    // Fetch forecasted values
    const [forecasts] = await pool.query(`
      SELECT 
        DATE_FORMAT(PeriodLabel, '%Y') AS Year,
        MONTH(PeriodLabel) AS Month,
        DATE_FORMAT(PeriodLabel, '%M') AS MonthName,
        NULL AS ActualValue,
        PredictedValue,
        ConfidenceLower,
        ConfidenceUpper,
        'forecast' AS DataType,
        ModelName,
        GeneratedAt
      FROM fact_forecast
      WHERE ForecastType = 'monthly_revenue'
      ORDER BY PeriodLabel
    `);

    // Combine actuals and forecasts
    const combined = [...actuals, ...forecasts].sort((a, b) => {
      if (a.Year !== b.Year) return a.Year - b.Year;
      return a.Month - b.Month;
    });

    // Get latest forecast metadata
    const [metaRows] = await pool.query(`
      SELECT 
        ModelName,
        MAX(GeneratedAt) AS LastGenerated
      FROM fact_forecast
      WHERE ForecastType = 'monthly_revenue'
      GROUP BY ModelName
    `);

    res.json({
      status: "success",
      data: {
        forecast: combined,
        metadata: {
          modelName: metaRows[0]?.ModelName || "HoltWinters",
          lastGenerated: metaRows[0]?.LastGenerated || null,
          forecastHorizonMonths: forecasts.length,
        },
      },
    });
  } catch (error) {
    console.error("Revenue forecast error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch revenue forecast",
    });
  }
};

// ==========================================
// PRODUCT DEMAND FORECAST
// Returns predicted demand per product for top N products
// ==========================================
const getProductDemandForecast = async (req, res) => {
  try {
    const horizonMonths = req.query.horizon || 6;
    const limit = req.query.limit || 20;

    // Get forecasted demand per product
    const [forecasts] = await pool.query(`
      SELECT 
        f.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Brand,
        DATE_FORMAT(f.PeriodLabel, '%Y-%m') AS Period,
        f.PredictedValue,
        f.ConfidenceLower,
        f.ConfidenceUpper,
        f.ModelName,
        f.GeneratedAt
      FROM fact_forecast f
      JOIN dim_product p ON f.ProductKey = p.ProductKey
      WHERE f.ForecastType = 'product_demand'
      AND f.PeriodLabel < DATE_ADD(CURRENT_DATE, INTERVAL ? MONTH)
      ORDER BY f.ProductKey, f.PeriodLabel
    `, [horizonMonths]);

    // Group by product for easier frontend consumption
    const byProduct = {};
    for (const row of forecasts) {
      if (!byProduct[row.ProductKey]) {
        byProduct[row.ProductKey] = {
          ProductKey: row.ProductKey,
          ProductID: row.ProductID,
          ProductName: row.ProductName,
          Forecasts: [],
        };
      }
      byProduct[row.ProductKey].Forecasts.push({
        Period: row.Period,
        PredictedValue: Number(row.PredictedValue),
        ConfidenceLower: row.ConfidenceLower ? Number(row.ConfidenceLower) : null,
        ConfidenceUpper: row.ConfidenceUpper ? Number(row.ConfidenceUpper) : null,
      });
    }

    // Sort by total predicted demand (descending) and limit
    const products = Object.values(byProduct)
      .map(p => ({
        ...p,
        TotalPredictedDemand: p.Forecasts.reduce((sum, f) => sum + f.PredictedValue, 0),
      }))
      .sort((a, b) => b.TotalPredictedDemand - a.TotalPredictedDemand)
      .slice(0, limit);

    // Get metadata
    const [metaRows] = await pool.query(`
      SELECT 
        ModelName,
        MAX(GeneratedAt) AS LastGenerated
      FROM fact_forecast
      WHERE ForecastType = 'product_demand'
      GROUP BY ModelName
    `);

    res.json({
      status: "success",
      data: {
        products,
        metadata: {
          modelName: metaRows[0]?.ModelName || "HoltWinters",
          lastGenerated: metaRows[0]?.LastGenerated || null,
          forecastHorizonMonths: horizonMonths,
          totalProducts: products.length,
        },
      },
    });
  } catch (error) {
    console.error("Product demand forecast error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch product demand forecast",
    });
  }
};

// ==========================================
// FORECAST METADATA
// Returns metadata about when forecasts were last generated
// ==========================================
const getForecastMetadata = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ForecastType,
        ModelName,
        MAX(GeneratedAt) AS LastGenerated,
        COUNT(*) AS RowCount,
        MIN(PeriodLabel) AS FirstPeriod,
        MAX(PeriodLabel) AS LastPeriod
      FROM fact_forecast
      GROUP BY ForecastType, ModelName
      ORDER BY ForecastType
    `);

    res.json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Forecast metadata error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch forecast metadata",
    });
  }
};

module.exports = {
  getRevenueForecast,
  getProductDemandForecast,
  getForecastMetadata,
};