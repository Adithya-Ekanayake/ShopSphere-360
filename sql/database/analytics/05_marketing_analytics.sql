USE shopsphere360;

CREATE OR REPLACE VIEW vw_marketing_analytics AS
SELECT
    m.MarketingKey,
    m.CampaignKey,
    c.CampaignName,
    c.CampaignType,

    m.DateKey,
    d.FullDate,
    d.Year,
    d.Month,
    d.MonthName,

    m.ChannelKey,
    ch.ChannelName,

    m.Impressions,
    m.Clicks,
    m.Leads,
    m.Conversions,

    m.Spend,
    m.AttributedRevenue,

    ROUND(
        m.Clicks / NULLIF(m.Impressions, 0) * 100,
        2
    ) AS CTRPercent,

    ROUND(
        m.Conversions / NULLIF(m.Clicks, 0) * 100,
        2
    ) AS ConversionRatePercent,

    ROUND(
        m.Spend / NULLIF(m.Conversions, 0),
        2
    ) AS CostPerConversion,

    ROUND(
        m.AttributedRevenue / NULLIF(m.Spend, 0),
        2
    ) AS ROAS

FROM fact_marketing m

JOIN dim_campaign c
    ON m.CampaignKey = c.CampaignKey

JOIN dim_date d
    ON m.DateKey = d.DateKey

JOIN dim_channel ch
    ON m.ChannelKey = ch.ChannelKey;


SELECT *
FROM vw_marketing_analytics
ORDER BY AttributedRevenue DESC;