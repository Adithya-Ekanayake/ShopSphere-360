import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../services/api";
import { serializeFilters } from "../services/analyticsService";
import { useFilters } from "../context/FilterContext";
import FilterBar from "../components/FilterBar";
import ExportMenu from "../components/ExportMenu";
import "../styles/dashboard.css";
import "../styles/advancedAnalytics.css";

type RfmRow = {
  CustomerName: string;
  CustomerSegment?: string;
  RecencyDays: number | string;
  Frequency: number | string;
  MonetaryValue: number | string;
  RFMScore: number | string;
  RFMSegment: string;
};

type ClvRow = {
  CustomerName: string;
  CustomerSegment?: string;
  Frequency: number | string;
  TotalRevenue: number | string;
  PredictedCLV: number | string;
};

type RetentionRow = {
  PeriodStart: string;
  PeriodLabel: string;
  CustomerSegment?: string;
  RepeatCustomerRatePercent: number | string;
  RetentionRatePercent: number | string | null;
};

type ProfitabilityRow = {
  ProductName: string;
  Category?: string;
  TotalRevenue: number | string;
  TotalProfit: number | string;
  ProfitMarginPercent: number | string | null;
  MarginFlag: string;
};

type CohortRow = {
  CohortMonth: string;
  PurchaseMonth: string;
  CustomerSegment?: string;
  MonthsSinceAcquisition: number | string;
  RetentionRatePercent: number | string;
  RevenuePerActiveCustomer: number | string;
};

type SectionState<T> = {
  data: T[];
  loading: boolean;
  error: string;
};

type AdvancedState = {
  rfm: SectionState<RfmRow>;
  clv: SectionState<ClvRow>;
  retention: SectionState<RetentionRow>;
  profitability: SectionState<ProfitabilityRow>;
  cohorts: SectionState<CohortRow>;
};

const emptySection = <T,>(): SectionState<T> => ({
  data: [],
  loading: true,
  error: "",
});

const createInitialState = (): AdvancedState => ({
  rfm: emptySection<RfmRow>(),
  clv: emptySection<ClvRow>(),
  retention: emptySection<RetentionRow>(),
  profitability: emptySection<ProfitabilityRow>(),
  cohorts: emptySection<CohortRow>(),
});

const formatCurrency = (value: number | string) =>
  `LKR ${Number(value || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const AdvancedSection = ({
  title,
  description,
  state,
  children,
}: {
  title: string;
  description: string;
  state: SectionState<unknown>;
  children: ReactNode;
}) => (
  <section className="panel advanced-section">
    <div className="panel-header">
      <div>
        <span className="panel-kicker">ADVANCED ANALYTICS</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
    <div className="panel-body advanced-section-body">
      {state.loading ? <div className="chart-status"><p>Loading {title.toLowerCase()}...</p></div> : null}
      {!state.loading && state.error ? <div className="chart-status chart-error"><p>{state.error}</p></div> : null}
      {!state.loading && !state.error && state.data.length === 0 ? <div className="chart-status"><p>No data available for this filter combination.</p></div> : null}
      {!state.loading && !state.error && state.data.length > 0 ? children : null}
    </div>
  </section>
);

const AdvancedAnalytics = () => {
  const { filters } = useFilters();
  const [sections, setSections] = useState<AdvancedState>(createInitialState);

  useEffect(() => {
    let cancelled = false;
    const query = serializeFilters(filters);
    const requests: Array<[keyof AdvancedState, string]> = [
      ["rfm", "/analytics/rfm"],
      ["clv", "/analytics/clv"],
      ["retention", "/analytics/retention"],
      ["profitability", "/analytics/product-profitability"],
      ["cohorts", "/analytics/cohorts"],
    ];

    setSections(createInitialState());

    const loadSections = async () => {
      const results = await Promise.allSettled(
        requests.map(async ([key, endpoint]) => {
          const response = await api.get(`${endpoint}?${query}`);
          return [key, response.data?.data ?? []] as const;
        })
      );

      if (cancelled) return;

      setSections((current) => {
        const next = { ...current };
        results.forEach((result, index) => {
          const key = requests[index][0];
          if (result.status === "fulfilled") {
            next[key] = { data: result.value[1], loading: false, error: "" };
          } else {
            console.error(`Failed to load ${key} analytics:`, result.reason);
            next[key] = { data: [], loading: false, error: "Unable to load this analysis." };
          }
        });
        return next;
      });
    };

    loadSections();

    return () => {
      cancelled = true;
    };
  }, [filters]);

  const rfmSegments = useMemo(() => {
    const counts = new Map<string, number>();
    sections.rfm.data.forEach((row) => counts.set(row.RFMSegment, (counts.get(row.RFMSegment) ?? 0) + 1));
    return Array.from(counts, ([segment, customers]) => ({ segment, customers })).sort((a, b) => b.customers - a.customers);
  }, [sections.rfm.data]);

  const clvSegments = useMemo(() => {
    const totals = new Map<string, { total: number; count: number }>();
    sections.clv.data.forEach((row) => {
      const segment = row.CustomerSegment || "Unknown";
      const current = totals.get(segment) ?? { total: 0, count: 0 };
      current.total += Number(row.PredictedCLV || 0);
      current.count += 1;
      totals.set(segment, current);
    });
    return Array.from(totals, ([segment, values]) => ({ segment, average: values.total / values.count }));
  }, [sections.clv.data]);

  const retentionTrend = useMemo(() => {
    const byPeriod = new Map<string, RetentionRow>();
    sections.retention.data.forEach((row) => {
      const existing = byPeriod.get(row.PeriodStart);
      if (!existing || !row.CustomerSegment) byPeriod.set(row.PeriodStart, row);
    });
    return Array.from(byPeriod.values()).sort((a, b) => a.PeriodStart.localeCompare(b.PeriodStart));
  }, [sections.retention.data]);

  const latestRetention = retentionTrend[retentionTrend.length - 1];

  const topClvCustomers = useMemo(() => {
    const seenClv = new Set<string>();
    return sections.clv.data.filter((row) => {
      const clv = String(row.PredictedCLV);
      if (seenClv.has(clv)) return false;
      seenClv.add(clv);
      return true;
    }).slice(0, 10);
  }, [sections.clv.data]);

  const cohortRows = useMemo(() => {
    const rows = [...sections.cohorts.data];
    return rows.sort((a, b) => a.CohortMonth.localeCompare(b.CohortMonth) || Number(a.MonthsSinceAcquisition) - Number(b.MonthsSinceAcquisition));
  }, [sections.cohorts.data]);

  return (
    <>
      <header className="topbar">
        <div className="page-title">
          <p className="breadcrumb">ANALYTICS</p>
          <h1>Advanced Analytics</h1>
        </div>
      </header>

      <FilterBar />
      <div className="export-menu advanced-export-menu">
        <ExportMenu dataset="rfm" label="RFM Segmentation" />
        <ExportMenu dataset="clv" label="Customer Lifetime Value" />
        <ExportMenu dataset="product-profitability" label="Product Profitability" />
      </div>

      <div className="advanced-grid">
        <AdvancedSection title="RFM Segmentation" description="Customer value and engagement using transparent 1-5 recency, frequency, and monetary scores." state={sections.rfm}>
          <div className="advanced-chart-wrap">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rfmSegments} margin={{ top: 10, right: 15, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="segment" angle={-18} textAnchor="end" height={55} tick={{ fontSize: 10, fill: "var(--chart-axis-text)" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--chart-axis-text)" }} />
                <Tooltip />
                <Bar dataKey="customers" name="Customers" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="advanced-stat-row"><strong>{sections.rfm.data.length.toLocaleString()}</strong><span>customers scored across {rfmSegments.length} segments</span></div>
        </AdvancedSection>

        <AdvancedSection title="Customer Lifetime Value" description="Predictive CLV = average order value x purchase frequency x estimated 24-month lifespan." state={sections.clv}>
          <div className="advanced-two-column">
            <div className="advanced-table-wrap">
              <h3>Top CLV customers</h3>
              <table className="advanced-table"><thead><tr><th>Customer</th><th>Segment</th><th>Predicted CLV</th></tr></thead><tbody>
                {topClvCustomers.map((row, index) => <tr key={`${row.CustomerName}-${row.CustomerSegment}-${index}`}><td>{row.CustomerName}</td><td>{row.CustomerSegment || "Unknown"}</td><td>{formatCurrency(row.PredictedCLV)}</td></tr>)}
              </tbody></table>
            </div>
            <div className="advanced-chart-wrap"><h3>Average CLV by segment</h3><ResponsiveContainer width="100%" height={260}><BarChart data={clvSegments}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="segment" tick={{ fontSize: 10, fill: "var(--chart-axis-text)" }} /><YAxis tickFormatter={(value) => `${Math.round(value / 1000)}K`} tick={{ fontSize: 11, fill: "var(--chart-axis-text)" }} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="average" name="Average CLV" fill="#0f766e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
        </AdvancedSection>

        <AdvancedSection title="Retention & Repeat Purchase" description="Repeat rate measures multiple orders in a month; retention measures customers returning month-over-month." state={sections.retention}>
          <div className="advanced-stat-row"><strong>{latestRetention ? `${Number(latestRetention.RetentionRatePercent ?? 0).toFixed(1)}%` : "—"}</strong><span>latest month-over-month retention</span><strong>{latestRetention ? `${Number(latestRetention.RepeatCustomerRatePercent).toFixed(1)}%` : "—"}</strong><span>latest repeat rate</span></div>
          <div className="advanced-chart-wrap"><ResponsiveContainer width="100%" height={280}><LineChart data={retentionTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" /><XAxis dataKey="PeriodLabel" tick={{ fontSize: 10, fill: "var(--chart-axis-text)" }} /><YAxis unit="%" tick={{ fontSize: 11, fill: "var(--chart-axis-text)" }} /><Tooltip formatter={(value) => `${Number(value ?? 0).toFixed(1)}%`} /><Line type="monotone" dataKey="RepeatCustomerRatePercent" name="Repeat rate" stroke="var(--primary)" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="RetentionRatePercent" name="MoM retention" stroke="#0f766e" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>
        </AdvancedSection>

        <AdvancedSection title="Product Profitability" description="Revenue, cost, profit, and margin by product. Low Margin means below the documented 20% threshold." state={sections.profitability}>
          <div className="advanced-chart-wrap"><ResponsiveContainer width="100%" height={310}><BarChart data={sections.profitability.data.slice(0, 15)} layout="vertical" margin={{ left: 80, right: 15 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--chart-grid)" /><XAxis type="number" tickFormatter={(value) => `${Math.round(value / 1000000)}M`} tick={{ fontSize: 11, fill: "var(--chart-axis-text)" }} /><YAxis type="category" dataKey="ProductName" width={105} tick={{ fontSize: 10, fill: "var(--chart-axis-text)" }} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Bar dataKey="TotalProfit" name="Profit" radius={[0, 4, 4, 0]}>{sections.profitability.data.slice(0, 15).map((row) => <Cell key={row.ProductName} fill={row.MarginFlag === "Low Margin" ? "var(--danger)" : "var(--primary)"} />)}</Bar></BarChart></ResponsiveContainer></div>
          <div className="advanced-legend"><span className="legend-dot healthy-dot" /> Healthy margin <span className="legend-dot low-margin-dot" /> Low margin</div>
        </AdvancedSection>

        <AdvancedSection title="Cohort Retention" description="Cohorts are grouped by first purchase month; cells show retention percentage by months since acquisition." state={sections.cohorts}>
          <div className="cohort-table-wrap"><table className="advanced-table cohort-table"><thead><tr><th>Cohort</th><th>Segment</th><th>Month</th><th>Retention</th><th>Revenue / active customer</th></tr></thead><tbody>
            {cohortRows.slice(0, 120).map((row) => { const retention = Number(row.RetentionRatePercent); return <tr key={`${row.CohortMonth}-${row.PurchaseMonth}-${row.CustomerSegment}`}><td>{row.CohortMonth.slice(0, 7)}</td><td>{row.CustomerSegment || "Unknown"}</td><td>{row.MonthsSinceAcquisition}</td><td><span className="cohort-cell" style={{ opacity: Math.max(0.2, retention / 100) }}>{retention.toFixed(1)}%</span></td><td>{formatCurrency(row.RevenuePerActiveCustomer)}</td></tr>; })}
          </tbody></table></div>
        </AdvancedSection>
      </div>
    </>
  );
};

export default AdvancedAnalytics;
