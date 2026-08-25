USE shopsphere360;

CREATE OR REPLACE VIEW vw_monthly_sales AS
SELECT
    d.Year,
    d.Month,
    d.MonthName,

    COUNT(DISTINCT o.OrderKey) AS TotalOrders,

    SUM(oi.Quantity) AS UnitsSold,

    ROUND(SUM(oi.SalesAmount), 2) AS Revenue,

    ROUND(SUM(oi.ProfitAmount), 2) AS Profit,

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

JOIN dim_date d
    ON o.DateKey = d.DateKey

WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')

GROUP BY
    d.Year,
    d.Month,
    d.MonthName

ORDER BY
    d.Year,
    d.Month;


SELECT *
FROM vw_monthly_sales;