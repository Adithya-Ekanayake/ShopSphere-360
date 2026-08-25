USE shopsphere360;

CREATE OR REPLACE VIEW vw_customer_analytics AS
SELECT
    c.CustomerKey,
    c.CustomerID,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
    c.Gender,
    c.Age,
    c.CustomerSegment,
    c.AcquisitionChannel,
    c.City,
    c.Country,

    COUNT(DISTINCT o.OrderKey) AS TotalOrders,

    SUM(oi.Quantity) AS TotalUnitsPurchased,

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
    ) AS AverageOrderValue,

    CASE
        WHEN COUNT(DISTINCT o.OrderKey) = 1 THEN 'One-Time'
        WHEN COUNT(DISTINCT o.OrderKey) BETWEEN 2 AND 4 THEN 'Repeat'
        ELSE 'Loyal'
    END AS PurchaseBehavior

FROM dim_customer c

JOIN fact_orders o
    ON c.CustomerKey = o.CustomerKey

JOIN fact_order_items oi
    ON o.OrderKey = oi.OrderKey

WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')

GROUP BY
    c.CustomerKey,
    c.CustomerID,
    c.FirstName,
    c.LastName,
    c.Gender,
    c.Age,
    c.CustomerSegment,
    c.AcquisitionChannel,
    c.City,
    c.Country;


SELECT *
FROM vw_customer_analytics
ORDER BY TotalRevenue DESC;