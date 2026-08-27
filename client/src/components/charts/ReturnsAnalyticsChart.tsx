import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import api from "../../services/api";
import { serializeFilters } from "../../services/analyticsService";
import { useFilters } from "../../context/FilterContext";

interface ReturnData {
  ReturnReason?: string;
  QuantityReturned?: number | string;
  RefundAmount?: number | string;
}

interface ReasonData {
  reason: string;
  returns: number;
  percentage: number;
  refund: number;
}

const RETURN_COLORS = ["#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

const getReturnColor = (reason: string, index: number) =>
  reason.toLowerCase().includes("damaged")
    ? "var(--danger)"
    : RETURN_COLORS[index % RETURN_COLORS.length];

const ReturnsAnalyticsChart = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<ReasonData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const response = await api.get(
          `/analytics/returns?${serializeFilters(filters)}`
        );

        const returns: ReturnData[] =
          response.data.data ?? [];

        const reasonMap: Record<
          string,
          {
            returns: number;
            refund: number;
          }
        > = {};

        returns.forEach((item) => {
          const reason =
            item.ReturnReason?.trim() || "Unknown";

          const quantity = Number(
            item.QuantityReturned ?? 0
          );

          const refund = Number(
            item.RefundAmount ?? 0
          );

          if (!reasonMap[reason]) {
            reasonMap[reason] = {
              returns: 0,
              refund: 0,
            };
          }

          reasonMap[reason].returns += quantity;
          reasonMap[reason].refund += refund;
        });

        const totalReturns = Object.values(
          reasonMap
        ).reduce(
          (sum, item) => sum + item.returns,
          0
        );

        const formattedData: ReasonData[] =
          Object.entries(reasonMap)
            .map(([reason, values]) => ({
              reason,
              returns: values.returns,
              refund: values.refund,
              percentage:
                totalReturns > 0
                  ? Number(
                      (
                        (values.returns /
                          totalReturns) *
                        100
                      ).toFixed(1)
                    )
                  : 0,
            }))
            .sort(
              (a, b) =>
                b.returns - a.returns
            );

        setData(formattedData);
      } catch (err) {
        console.error(
          "Failed to fetch returns analytics:",
          err
        );

        setError(
          "Unable to load returns data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReturns();
  }, [filters]);

  /* =====================================================
     TOTALS
     ===================================================== */

  const totalReturnedUnits = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + item.returns,
      0
    );
  }, [data]);

  const totalRefundAmount = useMemo(() => {
    return data.reduce(
      (sum, item) => sum + item.refund,
      0
    );
  }, [data]);

  const topReturnReason = useMemo(() => {
    return data.length > 0
      ? data[0].reason
      : "—";
  }, [data]);

  /* =====================================================
     STATES
     ===================================================== */

  if (loading) {
    return (
      <div className="chart-status">
        <p>
          Loading returns analytics...
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

  if (data.length === 0) {
    return (
      <div className="chart-status">
        <p>
          No returns data available.
        </p>
      </div>
    );
  }

  return (
    <div className="returns-analytics-chart">

      {/* =================================================
          SUMMARY CARDS
          ================================================= */}

      <div className="returns-summary">

        <div className="returns-summary-card">
          <span>Returned Units</span>

          <strong>
            {totalReturnedUnits.toLocaleString()}
          </strong>

          <small>
            Total quantity returned
          </small>
        </div>

        <div className="returns-summary-card">
          <span>Refund Amount</span>

          <strong>
            LKR{" "}
            {totalRefundAmount.toLocaleString()}
          </strong>

          <small>
            Total refunds issued
          </small>
        </div>

        <div className="returns-summary-card">
          <span>Top Return Reason</span>

          <strong className="returns-reason-value">
            {topReturnReason}
          </strong>

          <small>
            Most frequently reported
          </small>
        </div>

      </div>

      {/* =================================================
          CHART HEADER
          ================================================= */}

      <div className="returns-chart-heading">

        <div>
          <h4>Return Reasons</h4>

          <p>
            Distribution of returned units by reason
          </p>
        </div>

        <div className="returns-total-label">
          {totalReturnedUnits.toLocaleString()} units
        </div>

      </div>

      {/* =================================================
          CHART
          ================================================= */}

      <div className="returns-chart-wrapper">

        <ResponsiveContainer
          width="100%"
          height={250}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{
              top: 8,
              right: 50,
              left: 5,
              bottom: 8,
            }}
            barCategoryGap="20%"
          >

            {/* =========================
                GRADIENTS
                ========================= */}

            <defs>

              {/* Normal returns */}
              <linearGradient
                id="returnsBlueGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#1d4ed8"
                />

                <stop
                  offset="55%"
                  stopColor="#2563eb"
                />

                <stop
                  offset="100%"
                  stopColor="#60a5fa"
                />
              </linearGradient>

              {/* Damaged returns */}
              <linearGradient
                id="returnsDamagedGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop
                  offset="0%"
                  stopColor="#b91c1c"
                />

                <stop
                  offset="55%"
                  stopColor="#dc2626"
                />

                <stop
                  offset="100%"
                  stopColor="#f87171"
                />
              </linearGradient>

            </defs>

            {/* =========================
                GRID
                ========================= */}

            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="var(--chart-grid)"
            />

            {/* =========================
                X AXIS
                ========================= */}

            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 11,
                fill:
                  "var(--chart-axis-text)",
              }}
              tickFormatter={(value) =>
                Number(
                  value
                ).toLocaleString()
              }
            />

            {/* =========================
                Y AXIS
                ========================= */}

            <YAxis
              type="category"
              dataKey="reason"
              width={145}
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 11,
                fill:
                  "var(--chart-axis-text)",
                fontWeight: 600,
              }}
            />

            {/* =========================
                TOOLTIP
                ========================= */}

            <Tooltip
              cursor={{
                fill:
                  "var(--chart-hover-bg)",
              }}
              contentStyle={{
                backgroundColor:
                  "var(--chart-tooltip-bg)",
                border:
                  "1px solid var(--chart-tooltip-border)",
                borderRadius: "10px",
                padding: "11px 14px",
                boxShadow:
                  "0 8px 24px rgba(0, 0, 0, 0.18)",
              }}
              labelStyle={{
                color:
                  "var(--tooltip-text)",
                fontWeight: 700,
                fontSize: "12px",
                marginBottom: "6px",
              }}
              itemStyle={{
                color:
                  "var(--chart-tooltip-text)",
                fontSize: "12px",
                fontWeight: 600,
              }}
              formatter={(value) => [
                `${Number(
                  value
                ).toLocaleString()} units`,
                "Returned",
              ]}
              labelFormatter={(label) => {
                const item =
                  data.find(
                    (entry) =>
                      entry.reason ===
                      label
                  );

                if (!item) {
                  return `Reason: ${label}`;
                }

                return `${label} • ${item.percentage}%`;
              }}
            />

            {/* =========================
                BAR
                ========================= */}

            <Bar
              dataKey="returns"
              name="Returned"
              radius={[
                0,
                7,
                7,
                0,
              ]}
              barSize={25}
              background={{
                fill:
                  "var(--chart-bar-background)",
                radius: 7,
              }}
            >

              {data.map((item, index) => {

                return (
                  <Cell
                    key={item.reason}
                    fill={getReturnColor(item.reason, index)}
                  />
                );
              })}

              <LabelList
                dataKey="returns"
                position="right"
                formatter={(value) =>
                  Number(
                    value
                  ).toLocaleString()
                }
                fill={
                  "var(--chart-value-text)"
                }
                fontSize={11}
                fontWeight={700}
              />

            </Bar>

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* =================================================
          BREAKDOWN
          ================================================= */}

      <div className="returns-breakdown">

        {data.map((item, index) => {

          return (
            <div
              className="returns-breakdown-item"
              key={item.reason}
            >

              <div className="returns-breakdown-left">

                <span
                  className="returns-reason-dot"
                  style={{
                    backgroundColor: getReturnColor(item.reason, index),
                  }}
                />

                <span>
                  {item.reason}
                </span>

              </div>

              <div className="returns-breakdown-right">

                <strong>
                  {item.returns.toLocaleString()}
                </strong>

                <span>
                  {item.percentage}%
                </span>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default ReturnsAnalyticsChart;