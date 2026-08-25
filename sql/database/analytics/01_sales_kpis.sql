USE shopsphere360;

CREATE OR REPLACE VIEW vw_sales_kpis AS
SELECT
    COUNT(DISTINCT o.OrderKey) AS TotalOrders,
    SUM(oi.Quantity) AS TotalUnitsSold,
    ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
    ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
    ROUND(
        SUM(oi.ProfitAmount)
        / NULLIF(SUM(oi.SalesAmount), 0) * 100,
        2
    ) AS ProfitMarginPercent,
    ROUND(
        SUM(oi.SalesAmount)
        / NULLIF(COUNT(DISTINCT o.OrderKey), 0),
        2
    ) AS AverageOrderValue
FROM fact_orders o
JOIN fact_order_items oi
    ON o.OrderKey = oi.OrderKey
WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned');

SELECT *
FROM vw_sales_kpis;