USE shopsphere360;

-- Products below 20% profit margin are flagged for review.
CREATE OR REPLACE VIEW vw_product_profitability AS
SELECT
    p.ProductKey,
    p.ProductID,
    p.ProductName,
    p.Category,
    p.Brand,
    ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
    ROUND(SUM(oi.CostAmount), 2) AS TotalCost,
    ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,
    ROUND(SUM(oi.ProfitAmount) / NULLIF(SUM(oi.SalesAmount), 0) * 100, 2) AS ProfitMarginPercent,
    20.00 AS LowMarginThresholdPercent,
    CASE
        WHEN SUM(oi.ProfitAmount) / NULLIF(SUM(oi.SalesAmount), 0) * 100 < 20.00 THEN 'Low Margin'
        ELSE 'Healthy Margin'
    END AS MarginFlag
FROM dim_product p
JOIN fact_order_items oi ON p.ProductKey = oi.ProductKey
JOIN fact_orders o ON oi.OrderKey = o.OrderKey
WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
GROUP BY p.ProductKey, p.ProductID, p.ProductName, p.Category, p.Brand;
