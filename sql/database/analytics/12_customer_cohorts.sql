USE shopsphere360;

-- A cohort is the calendar month of a customer's first completed purchase.
-- Month 0 is acquisition; later months show active customers and spend from that cohort.
CREATE OR REPLACE VIEW vw_customer_cohorts AS
WITH customer_purchases AS (
    SELECT
        o.CustomerKey,
        c.CustomerSegment,
        DATE_FORMAT(MIN(d.FullDate) OVER (PARTITION BY o.CustomerKey), '%Y-%m-01') AS CohortMonth,
        DATE_FORMAT(d.FullDate, '%Y-%m-01') AS PurchaseMonth,
        SUM(oi.SalesAmount) AS PeriodRevenue
    FROM fact_orders o
    JOIN fact_order_items oi ON o.OrderKey = oi.OrderKey
    JOIN dim_date d ON o.DateKey = d.DateKey
    JOIN dim_customer c ON o.CustomerKey = c.CustomerKey
    WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
    GROUP BY o.CustomerKey, c.CustomerSegment, d.FullDate
),
cohort_sizes AS (
    SELECT CohortMonth, CustomerSegment, COUNT(DISTINCT CustomerKey) AS CohortCustomers
    FROM customer_purchases
    GROUP BY CohortMonth, CustomerSegment
),
cohort_periods AS (
    SELECT
        p.CohortMonth,
        p.PurchaseMonth,
        p.CustomerSegment,
        COUNT(DISTINCT p.CustomerKey) AS ActiveCustomers,
        ROUND(SUM(p.PeriodRevenue), 2) AS PeriodRevenue
    FROM customer_purchases p
    GROUP BY p.CohortMonth, p.PurchaseMonth, p.CustomerSegment
)
SELECT
    cp.CohortMonth,
    cp.PurchaseMonth,
    cp.CustomerSegment,
    TIMESTAMPDIFF(MONTH, STR_TO_DATE(cp.CohortMonth, '%Y-%m-%d'), STR_TO_DATE(cp.PurchaseMonth, '%Y-%m-%d')) AS MonthsSinceAcquisition,
    cs.CohortCustomers,
    cp.ActiveCustomers,
    ROUND(cp.ActiveCustomers / NULLIF(cs.CohortCustomers, 0) * 100, 2) AS RetentionRatePercent,
    cp.PeriodRevenue,
    ROUND(cp.PeriodRevenue / NULLIF(cp.ActiveCustomers, 0), 2) AS RevenuePerActiveCustomer
FROM cohort_periods cp
JOIN cohort_sizes cs
    ON cs.CohortMonth = cp.CohortMonth
 AND cs.CustomerSegment <=> cp.CustomerSegment;
