const insight = (id, title, finding, implication, recommendation, metricValue, comparisonValue) => ({
  id, category: "Sales", severity: metricValue < 0 ? "critical" : "warning", title, finding, implication, recommendation, metricValue, comparisonValue, generatedAt: new Date().toISOString(),
});

module.exports = [
  { id: "sales-period-change", category: "Sales", evaluate(data, thresholds) {
    if (data.sales.length < 2) return null;
    const current = data.sales[data.sales.length - 1];
    const prior = data.sales[data.sales.length - 2];
    const currentValue = Number(current.Revenue || 0);
    const priorValue = Number(prior.Revenue || 0);
    const change = priorValue ? ((currentValue - priorValue) / priorValue) * 100 : 0;
    if (Math.abs(change) < thresholds.SALES_SIGNIFICANT_CHANGE_PERCENT) return null;
    return insight(this.id, "Sales changed materially", `Revenue changed ${change.toFixed(1)}% from ${prior.MonthName} ${prior.Year} to ${current.MonthName} ${current.Year}.`, "The latest period may need a commercial or operational review.", change < 0 ? "Review channel, product, and campaign performance before the next planning cycle." : "Document the drivers of growth and protect the strongest channels.", change, 0);
  } },
  { id: "sales-low-margin", category: "Sales", evaluate(data, thresholds) {
    const row = data.sales[data.sales.length - 1];
    if (!row) return null;
    const margin = Number(row.ProfitMarginPercent || 0);
    if (margin >= thresholds.SALES_LOW_MARGIN_PERCENT) return null;
    return insight(this.id, "Latest sales margin is low", `The latest period margin is ${margin.toFixed(1)}%, below the ${thresholds.SALES_LOW_MARGIN_PERCENT}% review threshold.`, "Revenue growth may not be translating into sufficient contribution.", "Review pricing, discounts, and product mix for the latest period.", margin, thresholds.SALES_LOW_MARGIN_PERCENT);
  } },
];
