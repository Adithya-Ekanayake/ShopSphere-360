USE shopsphere360;

WITH customer_metrics AS
(
    SELECT
        c.CustomerKey,
        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,

        COUNT(DISTINCT o.OrderKey) AS TotalOrders,

        ROUND(SUM(oi.SalesAmount), 2) AS TotalRevenue,

        ROUND(SUM(oi.ProfitAmount), 2) AS TotalProfit,

        ROUND(
            SUM(oi.SalesAmount)
            / NULLIF(COUNT(DISTINCT o.OrderKey), 0),
            2
        ) AS AverageOrderValue,

        MIN(d.FullDate) AS FirstPurchaseDate,

        MAX(d.FullDate) AS LastPurchaseDate

    FROM dim_customer c

    JOIN fact_orders o
        ON c.CustomerKey = o.CustomerKey

    JOIN fact_order_items oi
        ON o.OrderKey = oi.OrderKey

    JOIN dim_date d
        ON o.DateKey = d.DateKey

    WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')

    GROUP BY
        c.CustomerKey,
        c.FirstName,
        c.LastName
),

segmented_customers AS
(
    SELECT
        *,

        CASE
            WHEN TotalRevenue >= 500000 THEN 'VIP'
            WHEN TotalRevenue >= 350000 THEN 'High Value'
            WHEN TotalRevenue >= 200000 THEN 'Regular'
            ELSE 'Low Value'
        END AS CustomerSegment

    FROM customer_metrics
)

SELECT
    CustomerKey,
    CustomerName,
    TotalOrders,
    TotalRevenue,
    TotalProfit,
    AverageOrderValue,
    FirstPurchaseDate,
    LastPurchaseDate,
    CustomerSegment

FROM segmented_customers

ORDER BY
    TotalRevenue DESC;