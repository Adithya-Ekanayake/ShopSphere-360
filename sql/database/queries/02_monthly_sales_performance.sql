USE shopsphere360;

SELECT
    d.Year,
    d.Month,
    d.MonthName,

    COUNT(DISTINCT o.OrderKey) AS TotalOrders,

    ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,

    ROUND(SUM(oi.CostAmount), 2) AS TotalCost,

    ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,

    ROUND(
        SUM(oi.ProfitAmount)
        / NULLIF(SUM(oi.SalesAmount), 0) * 100,
        2
    ) AS ProfitMarginPercent,

    SUM(oi.Quantity) AS UnitsSold,

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