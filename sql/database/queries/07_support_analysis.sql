USE shopsphere360;

SELECT
    s.IssueType,
    s.Priority,

    COUNT(*) AS TotalTickets,

    ROUND(
        AVG(s.ResolutionTimeHours),
        2
    ) AS AverageResolutionTimeHours,

    ROUND(
        AVG(s.SatisfactionScore),
        2
    ) AS AverageSatisfactionScore,

    SUM(
        CASE
            WHEN s.Status = 'Resolved' THEN 1
            ELSE 0
        END
    ) AS ResolvedTickets,

    SUM(
        CASE
            WHEN s.Status <> 'Resolved' THEN 1
            ELSE 0
        END
    ) AS UnresolvedTickets,

    ROUND(
        SUM(
            CASE
                WHEN s.Status = 'Resolved' THEN 1
                ELSE 0
            END
        )
        / COUNT(*) * 100,
        2
    ) AS ResolutionRatePercent

FROM fact_support s

GROUP BY
    s.IssueType,
    s.Priority

ORDER BY
    AverageSatisfactionScore ASC,
    AverageResolutionTimeHours DESC;