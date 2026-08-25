USE shopsphere360;

CREATE OR REPLACE VIEW vw_support_analytics AS
SELECT
    s.SupportKey,

    s.TicketID,

    s.CustomerKey,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,

    s.DateKey,
    d.FullDate,
    d.Year,
    d.Month,
    d.MonthName,

    s.IssueType,
    s.Priority,

    s.ResolutionTimeHours,
    s.SatisfactionScore,
    s.Status,

    CASE
        WHEN s.ResolutionTimeHours <= 4 THEN 'Fast'
        WHEN s.ResolutionTimeHours <= 24 THEN 'Normal'
        WHEN s.ResolutionTimeHours <= 72 THEN 'Slow'
        ELSE 'Very Slow'
    END AS ResolutionSpeed,

    CASE
        WHEN s.SatisfactionScore >= 4 THEN 'Satisfied'
        WHEN s.SatisfactionScore >= 3 THEN 'Neutral'
        ELSE 'Dissatisfied'
    END AS SatisfactionCategory

FROM fact_support s

JOIN dim_customer c
    ON s.CustomerKey = c.CustomerKey

JOIN dim_date d
    ON s.DateKey = d.DateKey;


SELECT *
FROM vw_support_analytics
ORDER BY SatisfactionScore DESC;