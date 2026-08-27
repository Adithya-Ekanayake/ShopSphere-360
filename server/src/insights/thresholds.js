// Thresholds are intentionally explicit business-review triggers, not model parameters.
module.exports = {
  SALES_SIGNIFICANT_CHANGE_PERCENT: 10, // A 10% period change is large enough to warrant review.
  SALES_LOW_MARGIN_PERCENT: 20, // Below 20% leaves limited room for operating costs.
  MARKETING_LOW_ROAS: 2, // ROAS below 2x indicates weak return on paid spend.
  MARKETING_SIGNIFICANT_ROAS_CHANGE_PERCENT: 15,
  RETURNS_HIGH_RATE_PERCENT: 8, // Returns above 8% are operationally material.
  RETURNS_SIGNIFICANT_CHANGE_PERCENT: 15,
  CUSTOMERS_AT_RISK_SHARE_PERCENT: 25,
  CUSTOMERS_LOW_CHAMPION_SHARE_PERCENT: 15,
  SUPPORT_SLOW_RESOLUTION_HOURS: 48,
  SUPPORT_LOW_SATISFACTION: 3,
  SUPPORT_HIGH_OPEN_RATE_PERCENT: 40,
  PRODUCTS_LOW_MARGIN_PERCENT: 20,
  PRODUCTS_SIGNIFICANT_MARGIN_CHANGE_PERCENT: 10,
};
