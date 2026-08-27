const pool = require("../config/db");
const { buildFilterClause } = require("../utils/filterHelper");
const thresholds = require("./thresholds");
const salesRules = require("./rules/salesRules");

const DATASET_CONFIG = {
  sales: {
    view: "vw_monthly_sales",
    aliases: { dateColumn: "STR_TO_DATE(CONCAT(v.Year, '-', v.Month, '-01'), '%Y-%m-%d')", relevant: ["startDate", "endDate"] },
  },
  customers: { view: "vw_customer_analytics", aliases: { dateColumn: "v.CustomerKey", segmentColumn: "v.CustomerSegment", relevant: ["segment"] } },
  products: { view: "vw_product_analytics", aliases: { productColumn: "v.ProductKey", relevant: ["productKey"] } },
  "top-products": { view: "vw_product_analytics", aliases: { productColumn: "v.ProductKey", relevant: ["productKey"] }, suffix: " ORDER BY v.TotalRevenue DESC LIMIT 10" },
  returns: { view: "vw_returns_analytics", aliases: { dateColumn: "v.FullDate", productColumn: "v.ProductKey", channelColumn: "v.ChannelKey", statusColumn: "v.OrderStatus", relevant: ["startDate", "endDate", "productKey", "channelKey", "status"] } },
  rfm: { view: "vw_customer_rfm", aliases: { dateColumn: "v.LastPurchaseDate", segmentColumn: "v.CustomerSegment", relevant: ["startDate", "endDate", "segment"] } },
  clv: { view: "vw_customer_clv", aliases: { dateColumn: "v.LastPurchaseDate", segmentColumn: "v.CustomerSegment", relevant: ["startDate", "endDate", "segment"] } },
  "product-profitability": { view: "vw_product_profitability", aliases: { productColumn: "v.ProductKey", relevant: ["productKey"] } },
  marketing: { view: "vw_marketing_analytics", aliases: { dateColumn: "v.FullDate", channelColumn: "v.ChannelKey", relevant: ["startDate", "endDate", "channelKey"] } },
};

const queryView = async (view, filters, aliases = {}, columns = "v.*", suffix = "") => {
  const { whereClause, params } = buildFilterClause(filters, aliases);
  const [rows] = await pool.query(`SELECT ${columns} FROM ${view} v ${whereClause}${suffix}`, params);
  return rows;
};

const getExportRows = async (dataset, filters = {}) => {
  const config = DATASET_CONFIG[dataset];
  if (!config) throw new Error("Invalid dataset.");
  return queryView(config.view, filters, config.aliases, "v.*", config.suffix || "");
};

const loadInsightData = async (filters = {}) => ({
  sales: await queryView("vw_monthly_sales", filters, {
    dateColumn: "STR_TO_DATE(CONCAT(v.Year, '-', v.Month, '-01'), '%Y-%m-%d')",
    relevant: ["startDate", "endDate"],
  }),
  marketing: await queryView("vw_marketing_analytics", filters, { relevant: ["startDate", "endDate", "channelKey"] }),
  returns: await queryView("vw_returns_analytics", filters, { relevant: ["startDate", "endDate", "productKey", "channelKey", "status"] }),
  customers: await queryView("vw_customer_rfm", filters, { dateColumn: "v.LastPurchaseDate", segmentColumn: "v.CustomerSegment", relevant: ["startDate", "endDate", "segment"] }),
  support: await queryView("vw_support_analytics", filters, { statusColumn: "v.Status", relevant: ["startDate", "endDate", "status"] }),
  products: await queryView("vw_product_profitability", filters, { productColumn: "v.ProductKey", relevant: ["productKey"] }),
});

const evaluateInsights = async (filters = {}) => {
  const data = await loadInsightData(filters);
  const rules = [...salesRules, ...require("./rules/marketingRules"), ...require("./rules/returnRules"), ...require("./rules/customerRules"), ...require("./rules/supportRules"), ...require("./rules/productRules")];
  return rules.map((rule) => rule.evaluate(data, thresholds)).filter(Boolean);
};

module.exports = { evaluateInsights, loadInsightData, getExportRows };
