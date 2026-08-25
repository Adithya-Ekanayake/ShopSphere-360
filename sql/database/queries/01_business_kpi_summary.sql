USE shopsphere360;

SELECT
    -- Orders
    (SELECT COUNT(*)
     FROM fact_orders
     WHERE OrderStatus NOT IN ('Cancelled', 'Returned')
    ) AS TotalOrders,

    -- Customers
    (SELECT COUNT(*)
     FROM dim_customer
    ) AS TotalCustomers,

    (SELECT COUNT(DISTINCT CustomerKey)
     FROM fact_orders
     WHERE OrderStatus NOT IN ('Cancelled', 'Returned')
    ) AS ActiveCustomers,

    -- Sales
    (SELECT ROUND(SUM(SalesAmount), 2)
     FROM fact_order_items
    ) AS TotalRevenue,

    (SELECT ROUND(SUM(ProfitAmount), 2)
     FROM fact_order_items
    ) AS TotalProfit,

    ROUND(
        (
            (SELECT SUM(ProfitAmount)
             FROM fact_order_items)
            /
            NULLIF(
                (SELECT SUM(SalesAmount)
                 FROM fact_order_items),
                0
            )
        ) * 100,
        2
    ) AS ProfitMarginPercent,

    ROUND(
        (
            (SELECT SUM(SalesAmount)
             FROM fact_order_items)
            /
            NULLIF(
                (SELECT COUNT(*)
                 FROM fact_orders
                 WHERE OrderStatus NOT IN ('Cancelled', 'Returned')),
                0
            )
        ),
        2
    ) AS AverageOrderValue,

    (SELECT SUM(Quantity)
     FROM fact_order_items
    ) AS UnitsSold,

    -- Returns
    (SELECT COUNT(*)
     FROM fact_returns
    ) AS TotalReturns,

    (SELECT ROUND(SUM(RefundAmount), 2)
     FROM fact_returns
    ) AS TotalRefundAmount,

    -- Marketing
    (SELECT ROUND(SUM(Spend), 2)
     FROM fact_marketing
    ) AS MarketingSpend,

    (SELECT ROUND(SUM(AttributedRevenue), 2)
     FROM fact_marketing
    ) AS MarketingRevenue,

    ROUND(
        (
            (SELECT SUM(AttributedRevenue)
             FROM fact_marketing)
            /
            NULLIF(
                (SELECT SUM(Spend)
                 FROM fact_marketing),
                0
            )
        ),
        2
    ) AS MarketingROAS,

    -- Support
    (SELECT COUNT(*)
     FROM fact_support
    ) AS SupportTickets,

    (SELECT ROUND(AVG(SatisfactionScore), 2)
     FROM fact_support
     WHERE SatisfactionScore IS NOT NULL
    ) AS AverageSatisfaction;