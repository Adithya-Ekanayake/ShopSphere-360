USE shopsphere360;

CREATE OR REPLACE VIEW vw_product_analytics AS
SELECT
    p.ProductKey,
    p.ProductID,
    p.ProductName,
    p.Category,
    p.Subcategory,
    p.Brand,
    p.Supplier,

    SUM(oi.Quantity) AS UnitsSold,

    ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,

    ROUND(SUM(oi.CostAmount), 2) AS TotalCost,

    ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,

    ROUND(
        SUM(oi.ProfitAmount)
        / NULLIF(SUM(oi.SalesAmount), 0) * 100,
        2
    ) AS ProfitMarginPercent,

    COUNT(DISTINCT o.OrderKey) AS TotalOrders,

    ROUND(
        SUM(oi.SalesAmount)
        / NULLIF(SUM(oi.Quantity), 0),
        2
    ) AS AverageSellingPrice,

    COALESCE(SUM(r.QuantityReturned), 0) AS UnitsReturned,

    ROUND(
        COALESCE(SUM(r.RefundAmount), 0),
        2
    ) AS TotalRefundAmount,

    ROUND(
        COALESCE(SUM(r.QuantityReturned), 0)
        / NULLIF(SUM(oi.Quantity), 0) * 100,
        2
    ) AS ReturnRatePercent

FROM dim_product p

JOIN fact_order_items oi
    ON p.ProductKey = oi.ProductKey

JOIN fact_orders o
    ON oi.OrderKey = o.OrderKey

LEFT JOIN fact_returns r
    ON oi.ProductKey = r.ProductKey
    AND oi.OrderKey = r.OrderKey

WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')

GROUP BY
    p.ProductKey,
    p.ProductID,
    p.ProductName,
    p.Category,
    p.Subcategory,
    p.Brand,
    p.Supplier;


SELECT *
FROM vw_product_analytics
ORDER BY TotalRevenue DESC;