import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import api from "../services/api";

interface CustomerData {
  CustomerSegment?: string;
}

interface SegmentData {
  name: string;
  value: number;
}

const SEGMENT_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
];

const CustomerAnalyticsChart = () => {
  const [data, setData] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("/analytics/customers");

        const customers: CustomerData[] =
          Array.isArray(response.data?.data)
            ? response.data.data
            : [];

        const segmentCounts: Record<string, number> = {};

        customers.forEach((customer) => {
          const segment =
            customer.CustomerSegment?.trim() || "Unknown";

          segmentCounts[segment] =
            (segmentCounts[segment] || 0) + 1;
        });

        const formattedData = Object.entries(segmentCounts)
          .map(([name, value]) => ({
            name,
            value,
          }))
          .sort((a, b) => b.value - a.value);

        setData(formattedData);
      } catch (err) {
        console.error(
          "Failed to fetch customer analytics:",
          err
        );

        setError(
          "Unable to load customer analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const totalCustomers = useMemo(() => {
    return data.reduce(
      (total, item) => total + item.value,
      0
    );
  }, [data]);

  if (loading) {
    return (
      <div className="chart-status">
        <p>Loading customer analytics...</p>
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

  if (!data.length) {
    return (
      <div className="chart-status">
        <p>No customer data available.</p>
      </div>
    );
  }

  return (
    <div className="customer-analytics-chart">

      {/* ================= LEFT : DONUT ================= */}

      <div className="customer-donut-wrapper">

        <div className="customer-donut">

          <ResponsiveContainer
            width="100%"
            height={250}
          >
            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={103}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((segment, index) => (
                  <Cell
                    key={segment.name}
                    fill={
                      SEGMENT_COLORS[
                        index %
                          SEGMENT_COLORS.length
                      ]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  background:
                    "var(--chart-tooltip-bg, #172033)",
                  border:
                    "1px solid var(--chart-tooltip-border, #334155)",
                  borderRadius: "10px",
                  color:
                    "var(--chart-tooltip-text, #ffffff)",
                  boxShadow:
                    "0 8px 25px rgba(0,0,0,0.18)",
                }}
                itemStyle={{
                  color:
                    "var(--chart-tooltip-text, #ffffff)",
                }}
                formatter={(value, name) => [
                  `${Number(value).toLocaleString()} customers`,
                  String(name),
                ]}
              />

            </PieChart>
          </ResponsiveContainer>

          <div className="donut-center">

            <strong>
              {totalCustomers.toLocaleString()}
            </strong>

            <span>
              Total Customers
            </span>

          </div>

        </div>

      </div>

      {/* ================= RIGHT : BREAKDOWN ================= */}

      <div className="customer-breakdown">

        <div className="breakdown-header">

          <div>
            <h4>Customer Segments</h4>

            <p>
              Distribution of your customer base
            </p>
          </div>

        </div>

        <div className="segment-list">

          {data.map((segment, index) => {

            const percentage =
              totalCustomers > 0
                ? (segment.value /
                    totalCustomers) *
                  100
                : 0;

            const color =
              SEGMENT_COLORS[
                index % SEGMENT_COLORS.length
              ];

            return (
              <div
                className="segment-item"
                key={segment.name}
              >

                <div className="segment-top">

                  <div className="segment-label">

                    <span
                      className="segment-color"
                      style={{
                        backgroundColor: color,
                      }}
                    />

                    <span>
                      {segment.name}
                    </span>

                  </div>

                  <div className="segment-numbers">

                    <strong>
                      {segment.value.toLocaleString()}
                    </strong>

                    <span>
                      {percentage.toFixed(1)}%
                    </span>

                  </div>

                </div>

                <div className="segment-progress">

                  <div
                    className="segment-progress-fill"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color,
                    }}
                  />

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default CustomerAnalyticsChart;