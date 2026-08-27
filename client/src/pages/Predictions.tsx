import { useEffect, useState } from "react";
import {
  TrendingUp,
  Package,
  Calendar,
  AlertTriangle,
  Loader2,
  Info,
} from "lucide-react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";

import predictionService from "../services/predictionService";
import type {
  RevenueForecastPoint,
  ProductDemandForecast,
} from "../types/prediction";

import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";
import "../styles/admin.css";

const Predictions = () => {
  const { user } = useAuth();

  const [revenueData, setRevenueData] = useState<RevenueForecastPoint[]>([]);
  const [productDemandData, setProductDemandData] = useState<
    ProductDemandForecast[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [modelName, setModelName] = useState("HoltWinters");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [revenueRes, productRes] = await Promise.all([
          predictionService.getRevenueForecast(),
          predictionService.getProductDemandForecast(),
        ]);

        setRevenueData(revenueRes.forecast ?? []);
        setProductDemandData(productRes.products ?? []);
        setModelName(revenueRes.metadata?.modelName ?? "HoltWinters");
        setLastGenerated(revenueRes.metadata?.lastGenerated ?? null);
      } catch (err) {
        console.error("Failed to load predictions:", err);
        setError("Failed to load predictions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "—";
    }

    return `LKR ${Number(value).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return "—";
    }

    return Number(value).toLocaleString("en-LK");
  };

  const formatPercent = (current: number, previous: number) => {
    if (!previous || previous === 0) {
      return "—";
    }

    return `${(((current - previous) / previous) * 100).toFixed(1)}%`;
  };

  const chartData = revenueData.map((item) => ({
    period: `${item.MonthName?.substring(0, 3) ?? ""} ${item.Year}`,
    year: item.Year,
    month: item.Month,
    actual:
      item.DataType === "forecast"
        ? null
        : item.ActualValue ?? null,
    predicted:
      item.DataType === "forecast"
        ? item.PredictedValue ?? null
        : null,
    lower:
      item.DataType === "forecast"
        ? item.ConfidenceLower ?? null
        : null,
    upper:
      item.DataType === "forecast"
        ? item.ConfidenceUpper ?? null
        : null,
    isForecast: item.DataType === "forecast",
  }));

  const lastActualIndex = chartData.findLastIndex(
    (item) => !item.isForecast
  );

  const lastActualMonth =
    lastActualIndex >= 0
      ? chartData[lastActualIndex]
      : undefined;

  const firstForecastMonth =
    lastActualIndex >= 0
      ? chartData[lastActualIndex + 1]
      : chartData.find((item) => item.isForecast);

  const nextMonthRevenue = firstForecastMonth?.predicted ?? 0;
  const currentMonthRevenue = lastActualMonth?.actual ?? 0;

  const revenueGrowth =
    nextMonthRevenue && currentMonthRevenue
      ? formatPercent(nextMonthRevenue, currentMonthRevenue)
      : "—";

  const totalPredictedDemand = productDemandData.reduce(
    (sum, product) =>
      sum + Number(product.TotalPredictedDemand ?? 0),
    0
  );

  const topProduct = productDemandData[0];

  const forecastMonths = revenueData.filter(
    (item) => item.DataType === "forecast"
  );

  const isAnalyst = user?.Role === "Analyst";

  if (loading) {
    return (
      <div
        className="admin-loading"
        style={{ minHeight: "400px" }}
      >
        <Loader2
          className="admin-spinner"
          size={32}
        />

        <p>Loading predictions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="admin-error"
        style={{
          textAlign: "center",
          padding: "48px",
        }}
      >
        <AlertTriangle
          size={32}
          style={{
            color: "var(--danger)",
            marginBottom: "12px",
          }}
        />

        <p>{error}</p>
      </div>
    );
  }

  if (revenueData.length === 0) {
    return (
      <div
        className="admin-loading"
        style={{
          minHeight: "400px",
          textAlign: "center",
        }}
      >
        <Info
          size={32}
          style={{
            color: "var(--text-muted)",
            marginBottom: "12px",
          }}
        />

        <p>No forecast data available.</p>

        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            marginTop: "8px",
          }}
        >
          Run the Python forecasting script to generate
          predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* PAGE HEADER */}

      <div className="admin-header">
        <div>
          <p className="panel-kicker">
            PREDICTIONS
          </p>

          <h1>Revenue & Demand Forecasting</h1>

          <p className="admin-page-description">
            Batch-computed forecasts using Holt-Winters
            exponential smoothing. Updated monthly via
            offline batch script.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "12px",
            color: "var(--text-secondary)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--primary)",
              }}
            />

            Model: <strong>{modelName}</strong>
          </span>

          {lastGenerated && (
            <span>
              Last generated:{" "}
              <strong>
                {new Date(
                  lastGenerated
                ).toLocaleDateString("en-LK", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* KPI CARDS */}

      <section
        className="kpi-grid"
        style={{ marginTop: "16px" }}
      >
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <TrendingUp size={20} />
          </div>

          <div className="kpi-content">
            <span>Next Month Revenue</span>

            <strong>
              {formatCurrency(
                firstForecastMonth?.predicted
              )}
            </strong>

            <small>
              {revenueGrowth === "—"
                ? "No comparison available"
                : revenueGrowth.startsWith("-")
                ? `↓ ${revenueGrowth} vs current month`
                : `↑ ${revenueGrowth} vs current month`}
            </small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Package size={20} />
          </div>

          <div className="kpi-content">
            <span>Total Predicted Demand (6mo)</span>

            <strong>
              {formatNumber(totalPredictedDemand)}
            </strong>

            <small>
              Units across top products
            </small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Package size={20} />
          </div>

          <div className="kpi-content">
            <span>Top Product (Predicted)</span>

            <strong>
              {topProduct?.ProductName ?? "—"}
            </strong>

            <small>
              {formatNumber(
                topProduct?.TotalPredictedDemand
              )}{" "}
              units (6mo)
            </small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Calendar size={20} />
          </div>

          <div className="kpi-content">
            <span>Forecast Horizon</span>

            <strong>6 Months</strong>

            <small>
              Monthly granularity
            </small>
          </div>
        </div>
      </section>

      {/* REVENUE FORECAST CHART */}

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              REVENUE FORECAST
            </span>

            <h2>
              Monthly Revenue: Actual vs Predicted
            </h2>

            <p>
              Solid line = historical actuals • Dashed
              line = forecast • Shaded area = 95%
              confidence interval
            </p>
          </div>
        </div>

        <div
          className="panel-body"
          style={{ minHeight: "380px" }}
        >
          <ResponsiveContainer
            width="100%"
            height={380}
          >
            <LineChart data={chartData}>
              <defs>
                <linearGradient
                  id="forecastGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--chart-grid)"
              />

              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: "var(--chart-axis-text)",
                }}
              />

              <YAxis
                tickFormatter={(value) =>
                  `LKR ${(Number(value) / 1e6).toFixed(1)}M`
                }
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 11,
                  fill: "var(--chart-axis-text)",
                }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    "var(--chart-tooltip-bg)",
                  border:
                    "1px solid var(--chart-tooltip-border)",
                  borderRadius: "8px",
                }}
                formatter={(value, name) => {
                  if (
                    value === null ||
                    value === undefined
                  ) {
                    return ["—", String(name)];
                  }

                  if (name === "actual") {
                    return [
                      formatCurrency(Number(value)),
                      "Actual Revenue",
                    ];
                  }

                  if (name === "predicted") {
                    return [
                      formatCurrency(Number(value)),
                      "Predicted Revenue",
                    ];
                  }

                  if (name === "lower") {
                    return [
                      formatCurrency(Number(value)),
                      "Lower Bound (95%)",
                    ];
                  }

                  if (name === "upper") {
                    return [
                      formatCurrency(Number(value)),
                      "Upper Bound (95%)",
                    ];
                  }

                  return [
                    String(value),
                    String(name),
                  ];
                }}
              />

              <Legend />

              {/* CONFIDENCE BAND */}

              <Area
                type="monotone"
                dataKey="upper"
                name="Upper Confidence Bound"
                fill="url(#forecastGradient)"
                stroke="none"
                connectNulls={false}
              />

              <Area
                type="monotone"
                dataKey="lower"
                name="Lower Confidence Bound"
                fill="url(#forecastGradient)"
                stroke="none"
                connectNulls={false}
              />

              {/* ACTUAL REVENUE */}

              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Revenue"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "var(--primary)",
                }}
                connectNulls={false}
              />

              {/* PREDICTED REVENUE */}

              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted Revenue"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#f59e0b",
                }}
                connectNulls={false}
              />

              {/* FORECAST START */}

              {lastActualIndex >= 0 && (
                <ReferenceLine
                  x={
                    chartData[lastActualIndex].period
                  }
                  stroke="var(--text-muted)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  label={{
                    value: "Forecast Start",
                    position: "top",
                    fill: "var(--text-muted)",
                    fontSize: 10,
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* PRODUCT DEMAND FORECAST */}

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              PRODUCT DEMAND
            </span>

            <h2>
              Top 20 Products - Predicted Demand
              (6 Months)
            </h2>

            <p>
              Predicted unit demand per product over the
              next 6 months
            </p>
          </div>
        </div>

        <div className="panel-body">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>
                    Rank
                  </th>

                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>

                  <th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    6-Mo Predicted Demand
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    Monthly Avg
                  </th>

                  <th
                    style={{
                      textAlign: "right",
                    }}
                  >
                    Confidence Range
                  </th>
                </tr>
              </thead>

              <tbody>
                {productDemandData
                  .slice(0, 20)
                  .map((product, index) => (
                    <tr
                      key={product.ProductKey}
                    >
                      <td
                        style={{
                          fontWeight: 600,
                          color: "var(--primary)",
                        }}
                      >
                        #{index + 1}
                      </td>

                      <td>
                        <strong>
                          {product.ProductName}
                        </strong>

                        <br />

                        <small
                          style={{
                            color:
                              "var(--text-secondary)",
                          }}
                        >
                          {product.ProductID}
                        </small>
                      </td>

                      <td>
                        <span className="category-badge">
                          {product.Category}
                        </span>
                      </td>

                      <td>
                        {product.Brand || "—"}
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {formatNumber(
                          product.TotalPredictedDemand
                        )}{" "}
                        units
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          color:
                            "var(--text-secondary)",
                        }}
                      >
                        {formatNumber(
                          Number(
                            product.TotalPredictedDemand
                          ) / 6
                        )}
                        /mo
                      </td>

                      <td
                        style={{
                          textAlign: "right",
                          fontSize: "12px",
                        }}
                      >
                        {product.Forecasts?.[0]
                          ?.ConfidenceLower !== null &&
                        product.Forecasts?.[0]
                          ?.ConfidenceLower !==
                          undefined &&
                        product.Forecasts?.[0]
                          ?.ConfidenceUpper !== null &&
                        product.Forecasts?.[0]
                          ?.ConfidenceUpper !==
                          undefined ? (
                          <>
                            {formatNumber(
                              product.Forecasts[0]
                                .ConfidenceLower
                            )}{" "}
                            –{" "}
                            {formatNumber(
                              product.Forecasts[0]
                                .ConfidenceUpper
                            )}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background:
                "var(--surface-soft)",
              borderRadius: "8px",
              border:
                "1px solid var(--border)",
              fontSize: "12px",
              color:
                "var(--text-secondary)",
            }}
          >
            <strong>Methodology:</strong>{" "}
            Holt-Winters Exponential Smoothing
            (additive trend, multiplicative seasonality,
            period=12). Forecasts are batch-computed
            offline and stored in{" "}
            <code>fact_forecast</code>. Re-run the Python
            script monthly to refresh. Confidence
            intervals are 95% prediction intervals from
            the fitted model.
          </div>
        </div>
      </section>

      {/* FORECAST METADATA */}

      <section
        className="panel"
        style={{ marginTop: "20px" }}
      >
        <div className="panel-header">
          <div>
            <span className="panel-kicker">
              MODEL INFO
            </span>

            <h2>Forecast Metadata</h2>

            <p>
              Information about the current forecast
              models and data freshness
            </p>
          </div>
        </div>

        <div className="panel-body">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Forecast Type</th>
                  <th>Model</th>
                  <th>Last Generated</th>
                  <th>Rows</th>
                  <th>Forecast Range</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>
                    <strong>
                      Monthly Revenue
                    </strong>
                  </td>

                  <td>{modelName}</td>

                  <td>
                    {lastGenerated
                      ? new Date(
                          lastGenerated
                        ).toLocaleString("en-LK")
                      : "—"}
                  </td>

                  <td>
                    {forecastMonths.length} months
                  </td>

                  <td>
                    {forecastMonths.length > 0
                      ? forecastMonths
                          .map(
                            (item) =>
                              `${item.MonthName} ${item.Year}`
                          )
                          .join(" – ")
                      : "—"}
                  </td>
                </tr>

                <tr>
                  <td>
                    <strong>
                      Product Demand
                    </strong>
                  </td>

                  <td>HoltWinters</td>

                  <td>
                    {lastGenerated
                      ? new Date(
                          lastGenerated
                        ).toLocaleString("en-LK")
                      : "—"}
                  </td>

                  <td>
                    {productDemandData.length} products
                    × 6 months
                  </td>

                  <td>
                    Next 6 months
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ANALYST ACCESS */}

      {isAnalyst && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px 16px",
            background: "var(--surface-soft)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--text-secondary)",
          }}
        >
          <strong>Analyst access:</strong>{" "}
          Predictions are available in read-only mode.
        </div>
      )}
    </div>
  );
};

export default Predictions;