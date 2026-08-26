import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import api from "../../services/api";

interface MonthlySales {
  Year: number;
  Month: number;
  MonthName: string;
  TotalOrders: number;
  UnitsSold: string;
  Revenue: string;
  Profit: string;
  ProfitMarginPercent: string;
  AverageOrderValue: string;
}

interface ChartData {
  period: string;
  year: number;
  month: number;
  revenue: number;
  profit: number;
}

interface TooltipPayload {
  dataKey?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

/* =========================================================
   NUMBER FORMATTERS
   ========================================================= */

const formatAxisValue = (value: number): string => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  const absoluteValue = Math.abs(numericValue);

  if (absoluteValue >= 1_000_000) {
    const millions = numericValue / 1_000_000;

    return `LKR ${millions.toFixed(1).replace(/\.0$/, "")}M`;
  }

  if (absoluteValue >= 1_000) {
    const thousands = numericValue / 1_000;

    return `LKR ${thousands.toFixed(0)}K`;
  }

  return `LKR ${numericValue.toLocaleString()}`;
};

const formatCurrency = (value: number): string => {
  return `LKR ${Number(value || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;
};

/* =========================================================
   CUSTOM TOOLTIP
   ========================================================= */

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const revenue = payload.find(
    (item) => item.dataKey === "revenue"
  )?.value;

  const profit = payload.find(
    (item) => item.dataKey === "profit"
  )?.value;

  return (
    <div className="sales-custom-tooltip">
      {/* HEADER */}

      <div className="sales-tooltip-header">
        {label}
      </div>

      {/* REVENUE */}

      <div className="sales-tooltip-row">
        <div className="sales-tooltip-label">
          <span
            className="sales-tooltip-dot revenue-dot"
          />

          <span>Revenue</span>
        </div>

        <strong>
          {formatCurrency(revenue ?? 0)}
        </strong>
      </div>

      {/* PROFIT */}

      <div className="sales-tooltip-row">
        <div className="sales-tooltip-label">
          <span
            className="sales-tooltip-dot profit-dot"
          />

          <span>Profit</span>
        </div>

        <strong>
          {formatCurrency(profit ?? 0)}
        </strong>
      </div>
    </div>
  );
};

/* =========================================================
   SALES CHART
   ========================================================= */

const SalesChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     FETCH DATA
     ======================================================= */

  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          "/analytics/monthly-sales"
        );

        const salesData: MonthlySales[] =
          response.data?.data ?? [];

        const formattedData: ChartData[] =
          salesData
            .map((item) => ({
              period: `${item.MonthName.substring(
                0,
                3
              )} ${String(item.Year).slice(-2)}`,

              year: Number(item.Year),

              month: Number(item.Month),

              revenue: Number(item.Revenue) || 0,

              profit: Number(item.Profit) || 0,
            }))
            .sort((a, b) => {
              if (a.year !== b.year) {
                return a.year - b.year;
              }

              return a.month - b.month;
            });

        setData(formattedData);
      } catch (err) {
        console.error(
          "Failed to fetch monthly sales:",
          err
        );

        setError(
          "Unable to load sales performance."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlySales();
  }, []);

  /* =======================================================
     CALCULATE Y-AXIS DOMAIN
     ======================================================= */

  const yAxisDomain = useMemo(() => {
    if (data.length === 0) {
      return [0, 1000000] as [number, number];
    }

    const allValues = data.flatMap((item) => [
      item.revenue,
      item.profit,
    ]);

    const maximumValue = Math.max(...allValues, 0);

    /*
     * Add 10% breathing room above the highest value.
     * This prevents the line from touching the top.
     */
    const paddedMaximum =
      maximumValue > 0
        ? maximumValue * 1.1
        : 1000000;

    /*
     * Round the maximum to a clean number.
     */
    let roundedMaximum: number;

    if (paddedMaximum >= 1_000_000) {
      roundedMaximum =
        Math.ceil(
          paddedMaximum / 500_000
        ) * 500_000;
    } else if (paddedMaximum >= 100_000) {
      roundedMaximum =
        Math.ceil(
          paddedMaximum / 50_000
        ) * 50_000;
    } else if (paddedMaximum >= 10_000) {
      roundedMaximum =
        Math.ceil(
          paddedMaximum / 10_000
        ) * 10_000;
    } else {
      roundedMaximum =
        Math.ceil(
          paddedMaximum / 1_000
        ) * 1_000;
    }

    return [0, roundedMaximum] as [
      number,
      number
    ];
  }, [data]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="chart-status">
        <p>
          Loading sales performance...
        </p>
      </div>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <div className="chart-status chart-error">
        <p>{error}</p>
      </div>
    );
  }

  /* =======================================================
     EMPTY
     ======================================================= */

  if (data.length === 0) {
    return (
      <div className="chart-status">
        <p>
          No sales data available.
        </p>
      </div>
    );
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="sales-chart">

      <div className="sales-chart-wrapper">

        <ResponsiveContainer
          width="100%"
          height={315}
        >
          <LineChart
            data={data}
            margin={{
              top: 15,
              right: 18,
              left: 5,
              bottom: 10,
            }}
          >

            {/* =================================================
                GRID
                ================================================= */}

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
              opacity={0.65}
            />

            {/* =================================================
                X AXIS
                ================================================= */}

            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              interval={0}
              height={35}
              tickFormatter={(
                value,
                index
              ) => {
                const item = data[index];

                if (!item) {
                  return "";
                }

                /*
                 * For long datasets, show selected months.
                 * Jan / May / Sep give reasonable spacing.
                 */
                if (
                  item.month === 1 ||
                  item.month === 5 ||
                  item.month === 9
                ) {
                  return String(value);
                }

                /*
                 * If there are only a few records,
                 * show every label.
                 */
                if (data.length <= 8) {
                  return String(value);
                }

                return "";
              }}
              tick={{
                fontSize: 11,
                fill: "var(--chart-axis-text)",
                fontWeight: 500,
              }}
            />

            {/* =================================================
                ONE SHARED Y AXIS
                ================================================= */}

            <YAxis
              domain={yAxisDomain}
              allowDataOverflow={false}
              tickLine={false}
              axisLine={false}
              width={75}
              tickCount={6}
              tick={{
                fontSize: 10,
                fill: "var(--chart-axis-text)",
                fontWeight: 500,
              }}
              tickFormatter={formatAxisValue}
            />

            {/* =================================================
                TOOLTIP
                ================================================= */}

            <Tooltip
              content={
                <CustomTooltip />
              }
              cursor={{
                stroke:
                  "var(--chart-grid)",
                strokeWidth: 1,
              }}
            />

            {/* =================================================
                REVENUE
                ================================================= */}

            <Line
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                fill: "var(--surface)",
              }}
              animationDuration={700}
              animationEasing="ease-out"
            />

            {/* =================================================
                PROFIT
                ================================================= */}

            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="var(--profit)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                strokeWidth: 2,
                fill: "var(--surface)",
              }}
              animationDuration={700}
              animationEasing="ease-out"
            />

          </LineChart>
        </ResponsiveContainer>

      </div>

      {/* =====================================================
          LEGEND
          ===================================================== */}

      <div className="chart-legend sales-chart-legend">

        <div className="legend-item">

          <span
            className="legend-dot"
            style={{
              backgroundColor:
                "var(--primary)",
            }}
          />

          <span>
            Revenue
          </span>

        </div>

        <div className="legend-item">

          <span
            className="legend-dot"
            style={{
              backgroundColor:
                "var(--profit)",
            }}
          />

          <span>
            Profit
          </span>

        </div>

      </div>

    </div>
  );
};

export default SalesChart;