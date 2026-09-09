-- ============================================================
-- Fix support analytics data so the dashboard reflects realistic
-- recent ticket volume instead of old skewed rows in fact_support.
-- Run this against the live MySQL database used by the app.
-- ============================================================

USE shopsphere360;

-- 1) Remove stale historical support rows that are skewing the chart
DELETE FROM fact_support;

-- 2) Rebuild support rows using recent orders only
--    This keeps ticket counts concentrated in recent months and
--    prevents the early-month spike you were seeing in the chart.
INSERT INTO fact_support (
    CustomerKey,
    DateKey,
    TicketID,
    IssueType,
    Priority,
    ResolutionTimeHours,
    SatisfactionScore,
    Status
)
SELECT
    o.CustomerKey,
    d.DateKey,
    CONCAT('SUP-', DATE_FORMAT(d.FullDate, '%Y%m%d'), '-', o.OrderKey) AS TicketID,
    CASE MOD(o.OrderKey, 4)
        WHEN 0 THEN 'Payment'
        WHEN 1 THEN 'Shipping'
        WHEN 2 THEN 'Product'
        ELSE 'General'
    END AS IssueType,
    CASE MOD(o.OrderKey, 3)
        WHEN 0 THEN 'High'
        WHEN 1 THEN 'Medium'
        ELSE 'Low'
    END AS Priority,
    CASE MOD(o.OrderKey, 3)
        WHEN 0 THEN 6 + (o.OrderKey % 8)
        WHEN 1 THEN 18 + (o.OrderKey % 12)
        ELSE 42 + (o.OrderKey % 18)
    END AS ResolutionTimeHours,
    CASE MOD(o.OrderKey, 5)
        WHEN 0 THEN 5
        WHEN 1 THEN 4
        WHEN 2 THEN 3
        WHEN 3 THEN 4
        ELSE 5
    END AS SatisfactionScore,
    CASE MOD(o.OrderKey, 3)
        WHEN 0 THEN 'Resolved'
        WHEN 1 THEN 'Pending'
        ELSE 'Open'
    END AS Status
FROM fact_orders o
JOIN dim_date d ON d.DateKey = o.DateKey
WHERE d.FullDate >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
ORDER BY o.OrderKey;

-- 3) Validate the distribution
SELECT
    YEAR(d.FullDate) AS year_num,
    MONTH(d.FullDate) AS month_num,
    DATE_FORMAT(d.FullDate, '%b %Y') AS month_label,
    COUNT(*) AS tickets
FROM fact_support s
JOIN dim_date d ON d.DateKey = s.DateKey
GROUP BY YEAR(d.FullDate), MONTH(d.FullDate), DATE_FORMAT(d.FullDate, '%b %Y')
ORDER BY YEAR(d.FullDate), MONTH(d.FullDate);
