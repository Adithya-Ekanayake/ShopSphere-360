USE shopsphere360;

-- Repeat rate counts customers with more than one order in the month.
-- Retention is current-month customers who also purchased in the prior calendar month,
-- divided by the prior month's customer count.
CREATE OR REPLACE VIEW vw_customer_retention AS
WITH customer_month AS (
    SELECT
        o.CustomerKey,
        c.CustomerSegment,
        DATE_FORMAT(d.FullDate, '%Y-%m-01') AS PeriodStart,
        COUNT(DISTINCT o.OrderKey) AS OrdersInPeriod
    FROM fact_orders o
    JOIN dim_date d ON o.DateKey = d.DateKey
    JOIN dim_customer c ON o.CustomerKey = c.CustomerKey
    WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
    GROUP BY o.CustomerKey, c.CustomerSegment, DATE_FORMAT(d.FullDate, '%Y-%m-01')
),
period_totals AS (
    SELECT
        PeriodStart,
        CustomerSegment,
        COUNT(*) AS TotalCustomers,
        SUM(CASE WHEN OrdersInPeriod > 1 THEN 1 ELSE 0 END) AS RepeatCustomers
    FROM customer_month
    GROUP BY PeriodStart, CustomerSegment
),
retained_totals AS (
    SELECT
        current_period.PeriodStart,
        current_period.CustomerSegment,
        COUNT(*) AS RetainedCustomers
    FROM customer_month current_period
    JOIN customer_month previous_period
      ON previous_period.CustomerKey = current_period.CustomerKey
     AND previous_period.PeriodStart = DATE_FORMAT(
         DATE_SUB(STR_TO_DATE(current_period.PeriodStart, '%Y-%m-%d'), INTERVAL 1 MONTH),
         '%Y-%m-01'
        )
        AND previous_period.CustomerSegment <=> current_period.CustomerSegment
        GROUP BY current_period.PeriodStart, current_period.CustomerSegment
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
    COALESCE(r.RetainedCustomers, 0) AS RetainedCustomers,
    LAG(p.TotalCustomers) OVER (PARTITION BY p.CustomerSegment ORDER BY p.PeriodStart) AS PreviousPeriodCustomers,
    ROUND(
        COALESCE(r.RetainedCustomers, 0)
        / NULLIF(LAG(p.TotalCustomers) OVER (PARTITION BY p.CustomerSegment ORDER BY p.PeriodStart), 0) * 100,
        2
    ) AS RetentionRatePercent
FROM period_totals p
LEFT JOIN retained_totals r
    ON r.PeriodStart = p.PeriodStart
 AND r.CustomerSegment <=> p.CustomerSegment;
