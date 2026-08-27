import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../../services/api";
import { serializeFilters } from "../../services/analyticsService";
import { useFilters } from "../../context/FilterContext";

interface MarketingData {
  ChannelName?: string;
  AttributedRevenue?: number | string;
  Spend?: number | string;
}

interface ChannelData {
  channel: string;
  roas: number;
}

interface TooltipPayload {
  payload?: ChannelData;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

const CustomTooltip = ({
  active,
  payload,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0]?.payload;

  if (!item) {
    return null;
  }

  return (
    <div className="marketing-tooltip">
      <div className="marketing-tooltip-title">
        {item.channel}
      </div>

      <div className="marketing-tooltip-row">
        <span className="marketing-tooltip-label">
          ROAS
        </span>

        <strong>
          {Number(item.roas).toFixed(2)}x
        </strong>
      </div>
    </div>
  );
};

const MarketingAnalyticsChart = () => {
  const { filters } = useFilters();
  const [data, setData] = useState<ChannelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarketingAnalytics = async () => {
      try {
        const response = await api.get(
          `/analytics/marketing?${serializeFilters(filters)}`
        );

        const marketingData: MarketingData[] =
          response.data?.data ?? [];

        const channelMap: Record<
          string,
          {
            revenue: number;
            spend: number;
          }
        > = {};

        marketingData.forEach((item) => {
          const channel =
            item.ChannelName?.trim() || "Unknown";

          const revenue = Number(
            item.AttributedRevenue ?? 0
          );

          const spend = Number(
            item.Spend ?? 0
          );

          if (!channelMap[channel]) {
            channelMap[channel] = {
              revenue: 0,
              spend: 0,
            };
          }

          if (Number.isFinite(revenue)) {
            channelMap[channel].revenue += revenue;
          }

          if (Number.isFinite(spend)) {
            channelMap[channel].spend += spend;
          }
        });

        const formattedData: ChannelData[] =
          Object.entries(channelMap)
            .filter(
              ([channel]) =>
                channel !== "Unknown"
            )
            .map(([channel, values]) => ({
              channel,
              roas:
                values.spend > 0
                  ? Number(
                      (
                        values.revenue /
                        values.spend
                      ).toFixed(2)
                    )
                  : 0,
            }))
            .filter(
              (item) =>
                Number.isFinite(item.roas) &&
                item.roas >= 0
            )
            .sort(
              (a, b) => b.roas - a.roas
            );

        setData(formattedData);
      } catch (err) {
        console.error(
          "Failed to fetch marketing analytics:",
          err
        );

        setError(
          "Unable to load marketing data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMarketingAnalytics();
  }, [filters]);

  if (loading) {
    return (
      <div className="chart-status">
        <p>Loading marketing analytics...</p>
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
        <p>No marketing data available.</p>
      </div>
    );
  }

  const averageRoas =
    data.reduce(
      (total, item) =>
        total + item.roas,
      0
    ) / data.length;

  return (
    <div className="marketing-analytics-chart">

      <div className="marketing-chart-summary">
        <div>
          <span>Average ROAS</span>

          <strong>
            {averageRoas.toFixed(2)}x
          </strong>
        </div>

        <span className="marketing-chart-unit">
          Return on advertising spend
        </span>
      </div>

      <div className="marketing-chart-wrapper">
        <ResponsiveContainer
          width="100%"
          height={330}
        >
          <BarChart
            data={data}
            margin={{
              top: 25,
              right: 15,
              left: 5,
              bottom: 30,
            }}
            barCategoryGap="18%"
          >

            <defs>
              <linearGradient
                id="marketingBlueGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#60a5fa"
                />

                <stop
                  offset="50%"
                  stopColor="#3b82f6"
                />

                <stop
                  offset="100%"
                  stopColor="#1d4ed8"
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />

            <XAxis
              dataKey="channel"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={60}
              tickMargin={10}
              angle={-25}
              textAnchor="end"
              tick={{
                fontSize: 9,
                fill: "var(--chart-axis-text)",
                fontWeight: 500,
              }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              width={45}
              tick={{
                fontSize: 10,
                fill: "var(--chart-axis-text)",
              }}
              tickFormatter={(value) =>
                `${Number(value).toFixed(0)}x`
              }
              domain={[0, "auto"]}
              allowDecimals
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                fill: "var(--chart-hover-bg)",
              }}
            />

            <Bar
              dataKey="roas"
              name="ROAS"
              fill="url(#marketingBlueGradient)"
              radius={[7, 7, 0, 0]}
              barSize={44}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span
            className="legend-dot"
            style={{
              background:
                "linear-gradient(180deg, #60a5fa, #1d4ed8)",
            }}
          />

          <span>ROAS</span>
        </div>
      </div>

    </div>
  );
};

export default MarketingAnalyticsChart;