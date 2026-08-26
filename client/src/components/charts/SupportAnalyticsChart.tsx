import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../../services/api";

interface SupportData {
  IssueType?: string;
  Priority?: string;
  ResolutionTimeHours?: number | string;
  SatisfactionScore?: number | string;
  Status?: string;
  FullDate?: string;
  DateKey?: number | string;
  Month?: number | string;
  MonthName?: string;
  Year?: number | string;
}

const SupportAnalyticsChart = () => {
  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSupportAnalytics = async () => {
      try {
        const response = await api.get("/analytics/support");

        const data: SupportData[] =
          response.data.data ?? [];

        setSupportData(data);
      } catch (err) {
        console.error(
          "Failed to fetch support analytics:",
          err
        );

        setError(
          "Unable to load support analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSupportAnalytics();
  }, []);

  /* =====================================================
     SUMMARY CALCULATIONS
     ===================================================== */

  const totalTickets = supportData.length;

  const averageResolution = useMemo(() => {
    if (!supportData.length) return 0;

    const total = supportData.reduce(
      (sum, item) =>
        sum +
        Number(item.ResolutionTimeHours ?? 0),
      0
    );

    return total / supportData.length;
  }, [supportData]);

  const averageSatisfaction = useMemo(() => {
    if (!supportData.length) return 0;

    const validScores = supportData.filter(
      (item) =>
        Number(item.SatisfactionScore ?? 0) > 0
    );

    if (!validScores.length) return 0;

    const total = validScores.reduce(
      (sum, item) =>
        sum +
        Number(item.SatisfactionScore ?? 0),
      0
    );

    return total / validScores.length;
  }, [supportData]);

  const resolvedRate = useMemo(() => {
    if (!supportData.length) return 0;

    const resolved = supportData.filter(
      (item) =>
        item.Status?.toLowerCase() ===
        "resolved"
    ).length;

    return (
      (resolved / supportData.length) * 100
    );
  }, [supportData]);

  /* =====================================================
     MONTHLY TREND
     ===================================================== */

  const monthlyData = useMemo(() => {
    const monthMap: Record<
      string,
      {
        tickets: number;
        resolutionTotal: number;
        satisfactionTotal: number;
        satisfactionCount: number;
        sortValue: number;
      }
    > = {};

    supportData.forEach((item) => {
      let year = Number(item.Year ?? 0);
      let month = Number(item.Month ?? 0);

      /* Fallback to DateKey */

      if ((!year || !month) && item.DateKey) {
        const dateString =
          String(item.DateKey);

        if (dateString.length === 8) {
          year = Number(
            dateString.substring(0, 4)
          );

          month = Number(
            dateString.substring(4, 6)
          );
        }
      }

      /* Fallback to FullDate */

      if (
        (!year || !month) &&
        item.FullDate
      ) {
        const date = new Date(
          item.FullDate
        );

        if (!Number.isNaN(date.getTime())) {
          year = date.getFullYear();
          month = date.getMonth() + 1;
        }
      }

      if (!year || !month) {
        return;
      }

      const key = `${year}-${String(
        month
      ).padStart(2, "0")}`;

      if (!monthMap[key]) {
        monthMap[key] = {
          tickets: 0,
          resolutionTotal: 0,
          satisfactionTotal: 0,
          satisfactionCount: 0,
          sortValue:
            year * 100 + month,
        };
      }

      monthMap[key].tickets += 1;

      monthMap[key].resolutionTotal +=
        Number(
          item.ResolutionTimeHours ?? 0
        );

      const satisfaction = Number(
        item.SatisfactionScore ?? 0
      );

      if (satisfaction > 0) {
        monthMap[
          key
        ].satisfactionTotal += satisfaction;

        monthMap[
          key
        ].satisfactionCount += 1;
      }

    });

    return Object.entries(monthMap)
      .sort(
        (a, b) =>
          a[1].sortValue -
          b[1].sortValue
      )
      .map(([key, values]) => {
        const [year, month] =
          key.split("-");

        const date = new Date(
          Number(year),
          Number(month) - 1,
          1
        );

        return {
          month: date.toLocaleString(
            "en-US",
            {
              month: "short",
              year: "2-digit",
            }
          ),

          tickets: values.tickets,

          resolution: Number(
            (
              values.resolutionTotal /
              values.tickets
            ).toFixed(1)
          ),

          satisfaction:
            values.satisfactionCount > 0
              ? Number(
                  (
                    values.satisfactionTotal /
                    values.satisfactionCount
                  ).toFixed(2)
                )
              : 0,
        };
      });
  }, [supportData]);

  /* =====================================================
     INSIGHTS
     ===================================================== */

  const mostCommonIssue = useMemo(() => {
    const counts: Record<
      string,
      number
    > = {};

    supportData.forEach((item) => {
      const issue =
        item.IssueType?.trim() ||
        "Unknown";

      counts[issue] =
        (counts[issue] || 0) + 1;
    });

    const result = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0];

    return result
      ? result[0]
      : "—";
  }, [supportData]);

  const bestRatedIssue = useMemo(() => {
    const issues: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    supportData.forEach((item) => {
      const issue =
        item.IssueType?.trim() ||
        "Unknown";

      const score = Number(
        item.SatisfactionScore ?? 0
      );

      if (score <= 0) return;

      if (!issues[issue]) {
        issues[issue] = {
          total: 0,
          count: 0,
        };
      }

      issues[issue].total += score;
      issues[issue].count += 1;
    });

    const result = Object.entries(issues)
      .map(([issue, values]) => ({
        issue,
        average:
          values.total / values.count,
      }))
      .sort(
        (a, b) =>
          b.average - a.average
      )[0];

    return result
      ? result.issue
      : "—";
  }, [supportData]);

  const slowestIssue = useMemo(() => {
    const issues: Record<
      string,
      {
        total: number;
        count: number;
      }
    > = {};

    supportData.forEach((item) => {
      const issue =
        item.IssueType?.trim() ||
        "Unknown";

      const resolution = Number(
        item.ResolutionTimeHours ?? 0
      );

      if (!issues[issue]) {
        issues[issue] = {
          total: 0,
          count: 0,
        };
      }

      issues[issue].total += resolution;
      issues[issue].count += 1;
    });

    const result = Object.entries(issues)
      .map(([issue, values]) => ({
        issue,
        average:
          values.total / values.count,
      }))
      .sort(
        (a, b) =>
          b.average - a.average
      )[0];

    return result
      ? result.issue
      : "—";
  }, [supportData]);

  /* =====================================================
     STATES
     ===================================================== */

  if (loading) {
    return (
      <div className="chart-status">
        <p>
          Loading support analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-status chart-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!supportData.length) {
    return (
      <div className="chart-status">
        <p>
          No support data available.
        </p>
      </div>
    );
  }

  /* =====================================================
     UI
     ===================================================== */

  return (
    <div className="support-analytics-chart">

      {/* KPI SUMMARY */}

      <div className="support-summary">

        <div className="support-summary-card">
          <span>Total Tickets</span>

          <strong>
            {totalTickets.toLocaleString()}
          </strong>

          <small>
            Support requests
          </small>
        </div>

        <div className="support-summary-card">
          <span>Avg. Resolution</span>

          <strong>
            {averageResolution.toFixed(1)}h
          </strong>

          <small>
            Average handling time
          </small>
        </div>

        <div className="support-summary-card">
          <span>Avg. Satisfaction</span>

          <strong>
            {averageSatisfaction.toFixed(2)}
            <small className="score-max">
              /5
            </small>
          </strong>

          <small>
            Customer rating
          </small>
        </div>

        <div className="support-summary-card">
          <span>Resolved Rate</span>

          <strong>
            {resolvedRate.toFixed(1)}%
          </strong>

          <small>
            Successfully resolved
          </small>
        </div>

      </div>

      {/* TREND */}

      <div className="support-trend">

        <div className="support-trend-header">
          <div>
            <h4>Support Activity</h4>

            <p>
              Monthly ticket volume
            </p>
          </div>
        </div>

        <ResponsiveContainer
          width="100%"
          height={240}
        >
          <AreaChart
            data={monthlyData}
            margin={{
              top: 10,
              right: 10,
              left: -10,
              bottom: 5,
            }}
          >

            <defs>
              <linearGradient
                id="supportAreaGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--primary)"
                  stopOpacity={0.28}
                />

                <stop
                  offset="100%"
                  stopColor="var(--primary)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 11,
                fill:
                  "var(--chart-axis-text)",
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{
                fontSize: 11,
                fill:
                  "var(--chart-axis-text)",
              }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor:
                  "var(--chart-tooltip-bg)",
                border:
                  "1px solid var(--chart-tooltip-border)",
                borderRadius: "10px",
                padding: "10px 13px",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.18)",
              }}
              labelStyle={{
                color:
                  "var(--tooltip-text)",
                fontWeight: 700,
                marginBottom: "6px",
              }}
              itemStyle={{
                color:
                  "var(--chart-tooltip-text)",
                fontSize: "12px",
              }}
              formatter={(value, name) => {

                if (
                  name === "Tickets"
                ) {
                  return [
                    Number(
                      value
                    ).toLocaleString(),
                    "Tickets",
                  ];
                }

                return [
                  value,
                  name,
                ];
              }}
            />

            <Area
              type="monotone"
              dataKey="tickets"
              name="Tickets"
              stroke="var(--primary)"
              strokeWidth={3}
              fill="url(#supportAreaGradient)"
              dot={{
                r: 3,
                strokeWidth: 2,
                fill: "var(--surface)",
              }}
              activeDot={{
                r: 5,
                strokeWidth: 2,
              }}
            />

          </AreaChart>
        </ResponsiveContainer>

      </div>

      {/* INSIGHTS */}

      <div className="support-insights">

        <div className="support-insight-card">
          <span>
            Most Common Issue
          </span>

          <strong>
            {mostCommonIssue}
          </strong>

          <small>
            Highest ticket volume
          </small>
        </div>

        <div className="support-insight-card">
          <span>
            Best Satisfaction
          </span>

          <strong>
            {bestRatedIssue}
          </strong>

          <small>
            Highest customer rating
          </small>
        </div>

        <div className="support-insight-card">
          <span>
            Slowest Resolution
          </span>

          <strong>
            {slowestIssue}
          </strong>

          <small>
            Requires attention
          </small>
        </div>

      </div>

    </div>
  );
};

export default SupportAnalyticsChart;