import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import api from "../../services/api";
import { serializeFilters } from "../../services/analyticsService";
import { useFilters } from "../../context/FilterContext";

interface CustomerData {
  CustomerSegment?: string;
}

interface SegmentData {
  name: string;
  value: number;
  percentage: number;
}

/*
 * Clearly separated blue shades.
 *
 * Regular    → Deep Blue
 * Occasional → Royal Blue
 * New        → Bright Blue
 * Premium    → Sky Blue
 */
const SEGMENT_COLORS = [
  "#1e3a8a",
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
];

const CustomerAnalyticsChart = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<SegmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH CUSTOMER ANALYTICS
     ===================================================== */

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get(
          `/analytics/customers?${serializeFilters(filters)}`
        );

        const customers: CustomerData[] =
          response.data.data ?? [];

        const segmentCounts: Record<string, number> =
          {};

        customers.forEach((customer) => {
          const segment =
            customer.CustomerSegment?.trim() ||
            "Unknown";

          segmentCounts[segment] =
            (segmentCounts[segment] || 0) + 1;
        });

        const total = Object.values(
          segmentCounts
        ).reduce(
          (sum, value) => sum + value,
          0
        );

        const formattedData: SegmentData[] =
          Object.entries(segmentCounts)
            .map(([name, value]) => ({
              name,
              value,
              percentage:
                total > 0
                  ? Number(
                      (
                        (value / total) *
                        100
                      ).toFixed(1)
                    )
                  : 0,
            }))
            .sort(
              (a, b) => b.value - a.value
            );

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
  }, [filters]);

  /* =====================================================
     TOTAL
     ===================================================== */

  const totalCustomers = useMemo(() => {
    return data.reduce(
      (total, item) => total + item.value,
      0
    );
  }, [data]);

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="chart-status">
        <p>
          Loading customer analytics...
        </p>
      </div>
    );
  }

  /* =====================================================
     ERROR
     ===================================================== */

  if (error) {
    return (
      <div className="chart-status chart-error">
        <p>{error}</p>
      </div>
    );
  }

  /* =====================================================
     EMPTY
     ===================================================== */

  if (data.length === 0) {
    return (
      <div className="chart-status">
        <p>
          No customer data available.
        </p>
      </div>
    );
  }

  /* =====================================================
     MAIN
     ===================================================== */

  return (
    <div className="customer-analytics-chart">

      <div className="customer-chart-layout">

        {/* =================================================
            DONUT
            ================================================= */}

        <div className="customer-donut-wrapper">

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
                outerRadius={105}
                paddingAngle={4}
                stroke="var(--surface)"
                strokeWidth={3}
                animationDuration={700}
              >

                {data.map((item, index) => (
                  <Cell
                    key={`segment-${item.name}`}
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
                  backgroundColor:
                    "var(--chart-tooltip-bg)",
                  border:
                    "1px solid var(--chart-tooltip-border)",
                  borderRadius: "10px",
                  padding: "10px 13px",
                  boxShadow:
                    "0 8px 24px rgba(0, 0, 0, 0.18)",
                }}
                labelStyle={{
                  color:
                    "var(--tooltip-text)",
                  fontWeight: 700,
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color:
                    "var(--tooltip-text)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
                formatter={(value, name) => {
                  const segment =
                    data.find(
                      (item) =>
                        item.name === name
                    );

                  return [
                    `${Number(
                      value
                    ).toLocaleString()} customers${
                      segment
                        ? ` (${segment.percentage}%)`
                        : ""
                    }`,
                    name,
                  ];
                }}
              />

            </PieChart>
          </ResponsiveContainer>

          {/* CENTER */}

          <div className="customer-donut-center">

            <strong>
              {totalCustomers.toLocaleString()}
            </strong>

            <span>
              Customers
            </span>

          </div>

        </div>

        {/* =================================================
            CLEAN LEGEND
            ================================================= */}

        <div className="customer-segment-list">

          {data.map((segment, index) => {

            const color =
              SEGMENT_COLORS[
                index %
                  SEGMENT_COLORS.length
              ];

            return (
              <div
                className="customer-segment-item"
                key={segment.name}
              >

                <div className="customer-segment-info">

                  <span
                    className="customer-segment-dot"
                    style={{
                      backgroundColor: color,
                    }}
                  />

                  <span className="customer-segment-name">
                    {segment.name}
                  </span>

                </div>

                <div className="customer-segment-stats">

                  <strong>
                    {segment.value.toLocaleString()}
                  </strong>

                  <span>
                    {segment.percentage}%
                  </span>

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