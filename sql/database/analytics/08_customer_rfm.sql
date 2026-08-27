USE shopsphere360;

-- RFM uses completed sales only. Scores are relative to the current dataset:
-- Recency: newer last purchase = higher score; Frequency/Monetary: higher = higher score.
CREATE OR REPLACE VIEW vw_customer_rfm AS
WITH customer_metrics AS (
    SELECT
        c.CustomerKey,
        c.CustomerID,
        CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,
        c.CustomerSegment,
        MAX(d.FullDate) AS LastPurchaseDate,
        DATEDIFF(
            (SELECT MAX(d2.FullDate)
             FROM fact_orders o2
             JOIN dim_date d2 ON o2.DateKey = d2.DateKey
             WHERE o2.OrderStatus NOT IN ('Cancelled', 'Returned')),
            MAX(d.FullDate)
        ) AS RecencyDays,
        COUNT(DISTINCT o.OrderKey) AS Frequency,
        ROUND(SUM(oi.SalesAmount), 2) AS MonetaryValue
    FROM dim_customer c
    JOIN fact_orders o ON c.CustomerKey = o.CustomerKey
    JOIN fact_order_items oi ON o.OrderKey = oi.OrderKey
    JOIN dim_date d ON o.DateKey = d.DateKey
    WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
    GROUP BY c.CustomerKey, c.CustomerID, c.FirstName, c.LastName, c.CustomerSegment
),
scored AS (
    SELECT
        customer_metrics.*,
        NTILE(5) OVER (ORDER BY RecencyDays DESC) AS RecencyScore,
        NTILE(5) OVER (ORDER BY Frequency ASC) AS FrequencyScore,
        NTILE(5) OVER (ORDER BY MonetaryValue ASC) AS MonetaryScore
    FROM customer_metrics
)
SELECT
    CustomerKey,
    CustomerID,
    CustomerName,
    CustomerSegment,
    LastPurchaseDate,
    RecencyDays,
    Frequency,
    MonetaryValue,
    RecencyScore,
    FrequencyScore,
    MonetaryScore,
    RecencyScore + FrequencyScore + MonetaryScore AS RFMScore,
    CASE
        WHEN RecencyScore >= 4 AND FrequencyScore >= 4 AND MonetaryScore >= 4 THEN 'Champions'
        WHEN RecencyScore >= 3 AND FrequencyScore >= 3 AND MonetaryScore >= 3 THEN 'Loyal Customers'
        WHEN RecencyScore >= 4 AND FrequencyScore <= 2 THEN 'Potential Loyalists'
        WHEN RecencyScore <= 2 AND FrequencyScore >= 3 THEN 'At Risk'
        WHEN RecencyScore <= 2 AND FrequencyScore <= 2 THEN 'Lost'
        ELSE 'Need Attention'
    END AS RFMSegment
FROM scored;

SELECT * FROM vw_customer_rfm ORDER BY RFMScore DESC, MonetaryValue DESC;
