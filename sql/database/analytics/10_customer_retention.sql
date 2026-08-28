USE shopsphere360;

-- Repeat rate counts customers with more than one order in the month.
-- Retention counts customers whose previous order was within the standard
-- 180-day retail repeat-purchase window for lower-frequency categories.
CREATE OR REPLACE VIEW vw_customer_retention AS
WITH ordered_orders AS (
    SELECT
        o.CustomerKey,
        c.CustomerSegment,
        o.OrderKey,
        d.FullDate AS OrderDate,
        LAG(d.FullDate) OVER (
            PARTITION BY o.CustomerKey
            ORDER BY d.FullDate, o.OrderKey
        ) AS PreviousOrderDate
    FROM fact_orders o
    JOIN dim_date d ON o.DateKey = d.DateKey
    JOIN dim_customer c ON o.CustomerKey = c.CustomerKey
    WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
),
customer_month AS (
    SELECT
        CustomerKey,
        CustomerSegment,
        DATE_FORMAT(OrderDate, '%Y-%m-01') AS PeriodStart,
        COUNT(DISTINCT OrderKey) AS OrdersInPeriod,
        MAX(
            CASE
                WHEN PreviousOrderDate IS NOT NULL
                 AND DATEDIFF(OrderDate, PreviousOrderDate) BETWEEN 1 AND 180
                THEN 1
                ELSE 0
            END
        ) AS HasRecentRepeat
    FROM ordered_orders
    GROUP BY CustomerKey, CustomerSegment, DATE_FORMAT(OrderDate, '%Y-%m-01')
),
period_totals AS (
    SELECT
        PeriodStart,
        CustomerSegment,
        COUNT(*) AS TotalCustomers,
        SUM(CASE WHEN OrdersInPeriod > 1 THEN 1 ELSE 0 END) AS RepeatCustomers,
        SUM(HasRecentRepeat) AS RetainedCustomers
    FROM customer_month
    GROUP BY PeriodStart, CustomerSegment
)
SELECT
    p.PeriodStart,
    p.CustomerSegment,
    YEAR(p.PeriodStart) AS Year,
    MONTH(p.PeriodStart) AS Month,
    DATE_FORMAT(p.PeriodStart, '%b %Y') AS PeriodLabel,
    p.TotalCustomers,
    p.RepeatCustomers,
    ROUND(p.RepeatCustomers / NULLIF(p.TotalCustomers, 0) * 100, 2) AS RepeatCustomerRatePercent,
    p.RetainedCustomers,
    LAG(p.TotalCustomers) OVER (PARTITION BY p.CustomerSegment ORDER BY p.PeriodStart) AS PreviousPeriodCustomers,
    ROUND(p.RetainedCustomers / NULLIF(p.TotalCustomers, 0) * 100, 2) AS RetentionRatePercent
FROM period_totals p;
