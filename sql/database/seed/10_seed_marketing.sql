USE shopsphere360;

INSERT INTO fact_marketing
(
    CampaignKey,
    DateKey,
    ChannelKey,
    Impressions,
    Clicks,
    Leads,
    Conversions,
    Spend,
    AttributedRevenue
)
SELECT
    1 + MOD(n.n * 7, 10) AS CampaignKey,
    d.DateKey,
    1 + MOD(n.n * 11, 9) AS ChannelKey,

    5000 + MOD(n.n * 137, 95000) AS Impressions,

    ROUND(
        (5000 + MOD(n.n * 137, 95000))
        * (0.02 + MOD(n.n * 13, 6) / 100),
        0
    ) AS Clicks,

    ROUND(
        (
            (5000 + MOD(n.n * 137, 95000))
            * (0.02 + MOD(n.n * 13, 6) / 100)
        )
        * (0.08 + MOD(n.n * 7, 8) / 100),
        0
    ) AS Leads,

    ROUND(
        (
            (
                (5000 + MOD(n.n * 137, 95000))
                * (0.02 + MOD(n.n * 13, 6) / 100)
            )
            * (0.08 + MOD(n.n * 7, 8) / 100)
        )
        * (0.10 + MOD(n.n * 5, 11) / 100),
        0
    ) AS Conversions,

    ROUND(
        500.00 + MOD(n.n * 173, 14500),
        2
    ) AS Spend,

    ROUND(
        (
            (
                (
                    (5000 + MOD(n.n * 137, 95000))
                    * (0.02 + MOD(n.n * 13, 6) / 100)
                )
                * (0.08 + MOD(n.n * 7, 8) / 100)
            )
            * (0.10 + MOD(n.n * 5, 11) / 100)
        )
        * (3500 + MOD(n.n * 97, 12000)),
        2
    ) AS AttributedRevenue

FROM
(
    SELECT
        a.n
        + b.n * 10
        + c.n * 100
        + 1 AS n
    FROM
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) c
) n

JOIN
(
    SELECT
        DateKey,
        ROW_NUMBER() OVER (ORDER BY DateKey) AS rn
    FROM dim_date
) d
    ON d.rn = 1 + MOD(n.n * 17, 1461)

WHERE n.n <= 1000;