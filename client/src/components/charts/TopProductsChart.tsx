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

interface ProductData {
  ProductName: string;
  TotalRevenue: number | string;
}

interface ChartData {
  product: string;
  fullProduct: string;
  revenue: number;
}

const TopProductsChart = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await api.get("/analytics/top-products");

        const products: ProductData[] = response.data.data;

        const formattedData: ChartData[] = products
          .map((item) => ({
            product:
              item.ProductName.length > 24
                ? `${item.ProductName.substring(0, 24)}...`
                : item.ProductName,
            fullProduct: item.ProductName,
            revenue: Number(item.TotalRevenue),
          }))
          .sort((a, b) => b.revenue - a.revenue);

        setData(formattedData);
      } catch (err) {
        console.error("Failed to fetch top products:", err);
        setError("Unable to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="chart-status">
        <p>Loading top products...</p>
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
        <p>No product data available.</p>
      </div>
    );
  }

  return (
    <div className="top-products-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 30,
            left: 10,
            bottom: 5,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
          />

          {/* Revenue scale */}
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "var(--chart-axis-text)",
            }}
            tickFormatter={(value) =>
              `LKR ${(Number(value) / 1000000).toFixed(0)}M`
            }
          />

          {/* Product names */}
          <YAxis
            type="category"
            dataKey="product"
            width={165}
            tickLine={false}
            axisLine={false}
            tick={{
              fontSize: 11,
              fill: "var(--chart-axis-text)",
              fontWeight: 500,
            }}
          />

          <Tooltip
  contentStyle={{
    backgroundColor: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: "8px",
    padding: "10px 12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.18)",
  }}
  labelStyle={{
    color: "var(--chart-tooltip-title)",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: "5px",
  }}
  itemStyle={{
    color: "var(--chart-tooltip-text)",
    fontSize: "12px",
    fontWeight: 600,
  }}
  cursor={{
    fill: "rgba(37, 99, 235, 0.06)",
  }}
  formatter={(value) =>
    `LKR ${Number(value).toLocaleString()}`
  }
  labelFormatter={(label) => {
    const product = data.find((item) => item.product === label);
    return `Product: ${product?.fullProduct ?? label}`;
  }}
/>

          {/* Revenue bars */}
          <Bar
            dataKey="revenue"
            name="Revenue"
            fill="var(--primary)"
            radius={[0, 5, 5, 0]}
            barSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopProductsChart;