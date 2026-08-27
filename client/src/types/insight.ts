export type InsightSeverity = "info" | "warning" | "critical";

export interface Insight {
  id: string;
  category: string;
  severity: InsightSeverity;
  title: string;
  finding: string;
  implication: string;
  recommendation: string;
  metricValue: number;
  comparisonValue: number;
  generatedAt: string;
}
