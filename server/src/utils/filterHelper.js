const FILTER_KEYS = new Set([
  "startDate",
  "endDate",
  "productKey",
  "segment",
  "channelKey",
  "locationKey",
  "status",
]);

const isScalar = (value) => typeof value === "string" && value.length > 0;

function parseDate(value, key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Invalid ${key} format. Use YYYY-MM-DD.`);
  }

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error(`Invalid ${key} value.`);
  }

  return value;
}

function parseKey(value, key) {
  if (!/^\d+$/.test(value) || Number(value) < 1) {
    throw new Error(`Invalid ${key}. Must be a positive integer.`);
  }

  return Number(value);
}

/**
 * Build a parameterized WHERE clause for the tables present in a controller query.
 * The optional aliases object keeps irrelevant filters out of endpoint SQL.
 */
function buildFilterClause(query = {}, aliases = {}) {
  for (const [key, value] of Object.entries(query)) {
    if (!FILTER_KEYS.has(key)) {
      throw new Error(`Invalid filter parameter: ${key}.`);
    }
    if (!isScalar(value)) {
      throw new Error(`Invalid ${key} value.`);
    }
  }

  const {
    date = "d",
    product = "p",
    customer = "c",
    channel = "ch",
    location = "l",
    order = "o",
    statusColumn,
    dateColumn = `${date}.FullDate`,
    productColumn = `${product}.ProductKey`,
    segmentColumn = `${customer}.CustomerSegment`,
    channelColumn = `${channel}.ChannelKey`,
    locationColumn = `${location}.LocationKey`,
    relevant = ["startDate", "endDate", "productKey", "segment", "channelKey", "locationKey", "status"],
  } = aliases;
  const relevantFilters = new Set(relevant);
  const conditions = [];
  const params = [];

  if (query.startDate && relevantFilters.has("startDate")) {
    conditions.push(`${dateColumn} >= ?`);
    params.push(parseDate(query.startDate, "startDate"));
  }
  if (query.endDate && relevantFilters.has("endDate")) {
    conditions.push(`${dateColumn} <= ?`);
    params.push(parseDate(query.endDate, "endDate"));
  }
  if (query.productKey && relevantFilters.has("productKey")) {
    conditions.push(`${productColumn} = ?`);
    params.push(parseKey(query.productKey, "productKey"));
  }
  if (query.segment && relevantFilters.has("segment")) {
    conditions.push(`${segmentColumn} = ?`);
    params.push(query.segment);
  }
  if (query.channelKey && relevantFilters.has("channelKey")) {
    conditions.push(`${channelColumn} = ?`);
    params.push(parseKey(query.channelKey, "channelKey"));
  }
  if (query.locationKey && relevantFilters.has("locationKey")) {
    conditions.push(`${locationColumn} = ?`);
    params.push(parseKey(query.locationKey, "locationKey"));
  }
  if (query.status && relevantFilters.has("status")) {
    conditions.push(`${statusColumn || `${order}.OrderStatus`} = ?`);
    params.push(query.status);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

const validateFilters = (query) => buildFilterClause(query);

/**
 * Get filter options for dropdowns from database.
 * Returns distinct values for each filter dimension.
 */
async function getFilterOptions(pool) {
  const [
    [segments],
    [channels],
    [locations],
    [categories],
    [brands],
    [subcategories],
    [statuses],
    [countries],
    [products],
  ] = await Promise.all([
    // Customer segments
    pool.query(`
      SELECT DISTINCT CustomerSegment AS value, CustomerSegment AS label
      FROM dim_customer
      WHERE CustomerSegment IS NOT NULL
      ORDER BY CustomerSegment
    `),
    // Channels
    pool.query(`
      SELECT ChannelKey AS value, ChannelName AS label
      FROM dim_channel
      ORDER BY ChannelName
    `),
    // Locations
    pool.query(`
      SELECT LocationKey AS value, CONCAT(City, ', ', Country) AS label
      FROM dim_location
      ORDER BY Country, City
    `),
    // Categories
    pool.query(`
      SELECT DISTINCT Category AS value, Category AS label
      FROM dim_product
      WHERE Category IS NOT NULL
      ORDER BY Category
    `),
    // Brands
    pool.query(`
      SELECT DISTINCT Brand AS value, Brand AS label
      FROM dim_product
      WHERE Brand IS NOT NULL
      ORDER BY Brand
    `),
    // Subcategories
    pool.query(`
      SELECT DISTINCT Subcategory AS value, Subcategory AS label
      FROM dim_product
      WHERE Subcategory IS NOT NULL
      ORDER BY Subcategory
    `),
    // Order statuses
    pool.query(`
      SELECT status AS value, status AS label
      FROM (
        SELECT DISTINCT OrderStatus AS status FROM fact_orders
        UNION
        SELECT DISTINCT Status AS status FROM fact_support
      ) statuses
      WHERE status IS NOT NULL
      ORDER BY status
    `),
    // Countries
    pool.query(`
      SELECT DISTINCT Country AS value, Country AS label
      FROM dim_customer
      WHERE Country IS NOT NULL
      ORDER BY Country
    `),
    // Products
    pool.query(`
      SELECT ProductKey AS value, CONCAT(ProductName, ' (', ProductID, ')') AS label
      FROM dim_product
      ORDER BY ProductName
    `),
  ]);

  return {
    segments: segments.map(r => ({ value: r.value, label: r.label })),
    channels: channels.map(r => ({ value: r.value, label: r.label })),
    locations: locations.map(r => ({ value: r.value, label: r.label })),
    categories: categories.map(r => ({ value: r.value, label: r.label })),
    brands: brands.map(r => ({ value: r.value, label: r.label })),
    subcategories: subcategories.map(r => ({ value: r.value, label: r.label })),
    statuses: statuses.map(r => ({ value: r.value, label: r.label })),
    countries: countries.map(r => ({ value: r.value, label: r.label })),
    products: products.map(r => ({ value: r.value, label: r.label })),
  };
}

/**
 * Build a filtered query for monthly sales with all possible joins.
 * The base query joins fact_orders -> fact_order_items -> dim_date -> dim_product -> dim_customer -> dim_channel -> dim_location
 */
function buildMonthlySalesQuery(whereClause) {
  return `
    SELECT 
      d.Year,
      d.Month,
      d.MonthName,
      COUNT(DISTINCT o.OrderKey) AS TotalOrders,
      SUM(oi.Quantity) AS UnitsSold,
      ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
      ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
      ROUND(
          SUM(oi.ProfitAmount)
          / NULLIF(SUM(oi.SalesAmount), 0) * 100,
          2
      ) AS ProfitMarginPercent,
      ROUND(
          SUM(oi.SalesAmount)
          / NULLIF(COUNT(DISTINCT o.OrderKey), 0),
          2
      ) AS AverageOrderValue
    FROM fact_orders o
    JOIN fact_order_items oi ON o.OrderKey = oi.OrderKey
    JOIN dim_date d ON o.DateKey = d.DateKey
    LEFT JOIN dim_product p ON oi.ProductKey = p.ProductKey
    LEFT JOIN dim_customer c ON o.CustomerKey = c.CustomerKey
    LEFT JOIN dim_channel ch ON o.ChannelKey = ch.ChannelKey
    LEFT JOIN dim_location l ON o.LocationKey = l.LocationKey
    ${whereClause}
    GROUP BY d.Year, d.Month, d.MonthName
    ORDER BY d.Year, d.Month
  `;
}

module.exports = {
  buildFilterClause,
  validateFilters,
  getFilterOptions,
  buildMonthlySalesQuery,
};