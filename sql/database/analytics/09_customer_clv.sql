USE shopsphere360;

-- Transparent CLV estimate: AOV x purchase frequency x estimated lifespan.
-- The 24-month lifespan is a documented planning assumption, not a model output.
CREATE OR REPLACE VIEW vw_customer_clv AS
SELECT
    c.CustomerKey,
    c.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    c.CustomerSegment,
    MIN(d.FullDate) AS FirstPurchaseDate,
    MAX(d.FullDate) AS LastPurchaseDate,
    COUNT(DISTINCT o.OrderKey) AS Frequency,
    ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,
    ROUND(SUM(oi.SalesAmount) / NULLIF(COUNT(DISTINCT o.OrderKey), 0), 2) AS AverageOrderValue,
    24 AS EstimatedLifespanMonths,
    ROUND(
        (SUM(oi.SalesAmount) / NULLIF(COUNT(DISTINCT o.OrderKey), 0))
        * COUNT(DISTINCT o.OrderKey) * 24,
        2
    ) AS PredictedCLV
FROM dim_customer c
JOIN fact_orders o ON c.CustomerKey = o.CustomerKey
JOIN fact_order_items oi ON o.OrderKey = oi.OrderKey
JOIN dim_date d ON o.DateKey = d.DateKey
WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
GROUP BY c.CustomerKey, c.CustomerID, c.FirstName, c.LastName, c.CustomerSegment;
