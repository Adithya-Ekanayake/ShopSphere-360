USE shopsphere360;

WITH product_sales AS
(
    SELECT
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand,

        SUM(oi.Quantity) AS UnitsSold,

        COUNT(DISTINCT oi.OrderKey) AS TotalOrders,

        ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,

        ROUND(SUM(oi.CostAmount), 2) AS TotalCost,

        ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,

        ROUND(
            SUM(oi.ProfitAmount)
            / NULLIF(SUM(oi.SalesAmount), 0) * 100,
            2
        ) AS ProfitMarginPercent,

        ROUND(
            SUM(oi.SalesAmount)
            / NULLIF(SUM(oi.Quantity), 0),
            2
        ) AS AverageSellingPrice

    FROM dim_product p

    JOIN fact_order_items oi
        ON p.ProductKey = oi.ProductKey

    JOIN fact_orders o
        ON oi.OrderKey = o.OrderKey

    WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')

    GROUP BY
        p.ProductKey,
        p.ProductID,
        p.ProductName,
        p.Category,
        p.Subcategory,
        p.Brand
),

product_returns AS
(
    SELECT
        ProductKey,

        SUM(QuantityReturned) AS UnitsReturned,

        ROUND(SUM(RefundAmount), 2) AS RefundAmount

    FROM fact_returns

    GROUP BY ProductKey
)

SELECT
    ps.ProductKey,
    ps.ProductID,
    ps.ProductName,
    ps.Category,
    ps.Subcategory,
    ps.Brand,

    ps.UnitsSold,
    COALESCE(pr.UnitsReturned, 0) AS UnitsReturned,

    ROUND(
        COALESCE(pr.UnitsReturned, 0)
        / NULLIF(ps.UnitsSold, 0) * 100,
        2
    ) AS ReturnRatePercent,

    ps.TotalOrders,
    ps.TotalRevenue,
    ps.TotalCost,
    ps.TotalProfit,
    ps.ProfitMarginPercent,
    ps.AverageSellingPrice,

    COALESCE(pr.RefundAmount, 0) AS RefundAmount

FROM product_sales ps

LEFT JOIN product_returns pr
    ON ps.ProductKey = pr.ProductKey

ORDER BY
    ps.TotalProfit DESC;