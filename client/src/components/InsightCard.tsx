import { AlertTriangle, CircleAlert, Info, Lightbulb } from "lucide-react";
import type { Insight } from "../types/insight";
import "../styles/insights.css";

const categoryIcons = {
  Sales: "S",
  Marketing: "M",
  Returns: "R",
  Customers: "C",
  Support: "S",
  Products: "P",
} as Record<string, string>;

const SeverityIcon = ({ severity }: { severity: Insight["severity"] }) => {
  if (severity === "critical") return <CircleAlert size={18} />;
  if (severity === "warning") return <AlertTriangle size={18} />;
  return <Info size={18} />;
};

const InsightCard = ({ insight }: { insight: Insight }) => (
  <article className={`insight-rule-card severity-${insight.severity}`}>
    <div className="insight-rule-heading">
      <span className="insight-category-icon">{categoryIcons[insight.category] ?? "I"}</span>
      <div>
        <span className="insight-category">{insight.category}</span>
        <h3>{insight.title}</h3>
      </div>
      <span className="insight-severity"><SeverityIcon severity={insight.severity} />{insight.severity}</span>
    </div>
    <p><strong>Finding:</strong> {insight.finding}</p>
    <p><strong>Implication:</strong> {insight.implication}</p>
    <div className="insight-recommendation"><Lightbulb size={16} /><span><strong>Recommendation:</strong> {insight.recommendation}</span></div>
    <footer>Metric: {insight.metricValue.toFixed(2)} · Comparison: {insight.comparisonValue.toFixed(2)}</footer>
  </article>
);

export default InsightCard;
