import { useEffect, useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import insightsService from "../services/insightsService";
import { useFilters } from "../context/FilterContext";
import FilterBar from "../components/FilterBar";
import InsightCard from "../components/InsightCard";
import type { Insight } from "../types/insight";
import "../styles/dashboard.css";
import "../styles/insights.css";

const Insights = () => {
  const { filters } = useFilters();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    insightsService.getInsights(filters).then((data) => {
      if (!cancelled) setInsights(data);
    }).catch((err) => {
      console.error("Failed to load insights:", err);
      if (!cancelled) setError("Unable to generate insights for this selection.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [filters]);

  const grouped = useMemo(() => insights.reduce<Record<string, Insight[]>>((groups, item) => {
    (groups[item.category] ??= []).push(item);
    return groups;
  }, {}), [insights]);

  return (
    <>
      <header className="topbar"><div className="page-title"><p className="breadcrumb">INSIGHTS</p><h1>Business Insights</h1></div></header>
      <FilterBar />
      {loading ? <div className="panel insight-empty">Generating explainable findings...</div> : null}
      {!loading && error ? <div className="panel insight-empty chart-error">{error}</div> : null}
      {!loading && !error && insights.length === 0 ? <div className="panel insight-empty"><Lightbulb size={28} /><h2>No significant findings</h2><p>Current metrics are within the configured review thresholds.</p></div> : null}
      {!loading && !error && insights.length > 0 ? <div className="insights-grid-page">{Object.entries(grouped).map(([category, items]) => <section className="panel insight-rule-group" key={category}><div className="panel-header"><div><span className="panel-kicker">RULE-BASED FINDINGS</span><h2>{category}</h2></div></div><div className="panel-body">{items.map((item) => <InsightCard key={item.id} insight={item} />)}</div></section>)}</div> : null}
    </>
  );
};

export default Insights;
