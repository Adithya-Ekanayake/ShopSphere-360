USE shopsphere360;

WITH product_sales AS
(
    SELECT
        ProductKey,
        SUM(Quantity) AS UnitsSold
    FROM fact_order_items
    GROUP BY ProductKey
),

product_returns AS
(
    SELECT
        ProductKey,
        COUNT(*) AS ReturnCount,
        SUM(QuantityReturned) AS UnitsReturned,
        ROUND(SUM(RefundAmount), 2) AS RefundAmount
    FROM fact_returns
    GROUP BY ProductKey
)

SELECT
    p.ProductKey,
    p.ProductID,
    p.ProductName,
    p.Category,
    p.Subcategory,
    p.Brand,

    COALESCE(ps.UnitsSold, 0) AS UnitsSold,

    COALESCE(pr.ReturnCount, 0) AS ReturnCount,

    COALESCE(pr.UnitsReturned, 0) AS UnitsReturned,

    ROUND(
        COALESCE(pr.UnitsReturned, 0)
        / NULLIF(ps.UnitsSold, 0) * 100,
        2
    ) AS ReturnRatePercent,

    COALESCE(pr.RefundAmount, 0) AS RefundAmount

FROM dim_product p

LEFT JOIN product_sales ps
    ON p.ProductKey = ps.ProductKey

LEFT JOIN product_returns pr
    ON p.ProductKey = pr.ProductKey

ORDER BY
    ReturnRatePercent DESC,
    RefundAmount DESC;