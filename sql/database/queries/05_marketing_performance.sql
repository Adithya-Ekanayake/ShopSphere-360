USE shopsphere360;

SELECT
    m.MarketingKey,

    c.CampaignName,
    ch.ChannelName,

    d.FullDate,
    d.Year,
    d.Month,
    d.MonthName,

    m.Impressions,
    m.Clicks,

    ROUND(
        m.Clicks / NULLIF(m.Impressions, 0) * 100,
        2
    ) AS CTRPercent,

    m.Leads,

    ROUND(
        m.Leads / NULLIF(m.Clicks, 0) * 100,
        2
    ) AS LeadConversionRatePercent,

    m.Conversions,

    ROUND(
        m.Conversions / NULLIF(m.Leads, 0) * 100,
        2
    ) AS ConversionRatePercent,

    m.Spend,
    m.AttributedRevenue,

    ROUND(
        m.AttributedRevenue / NULLIF(m.Spend, 0),
        2
    ) AS ROAS,

    ROUND(
        m.Spend / NULLIF(m.Clicks, 0),
        2
    ) AS CostPerClick,

    ROUND(
        m.Spend / NULLIF(m.Leads, 0),
        2
    ) AS CostPerLead,

    ROUND(
        m.Spend / NULLIF(m.Conversions, 0),
        2
    ) AS CostPerConversion

FROM fact_marketing m

JOIN dim_campaign c
    ON m.CampaignKey = c.CampaignKey

JOIN dim_channel ch
    ON m.ChannelKey = ch.ChannelKey

JOIN dim_date d
    ON m.DateKey = d.DateKey

ORDER BY
    m.AttributedRevenue DESC;