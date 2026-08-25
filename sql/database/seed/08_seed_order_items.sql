USE shopsphere360;

INSERT INTO fact_order_items
(
    OrderKey,
    ProductKey,
    Quantity,
    UnitPrice,
    DiscountAmount,
    SalesAmount,
    CostAmount,
    ProfitAmount
)
SELECT
    o.OrderKey,

    1 + MOD(o.OrderKey * 7 + item.n * 11, 50) AS ProductKey,

    1 + MOD(o.OrderKey + item.n * 3, 5) AS Quantity,

    p.UnitPrice,

    ROUND(
        (p.UnitPrice * (1 + MOD(o.OrderKey + item.n * 3, 5)))
        * (MOD(o.OrderKey + item.n * 17, 10) / 100),
        2
    ) AS DiscountAmount,

    ROUND(
        (
            p.UnitPrice * (1 + MOD(o.OrderKey + item.n * 3, 5))
        )
        -
        (
            (p.UnitPrice * (1 + MOD(o.OrderKey + item.n * 3, 5)))
            * (MOD(o.OrderKey + item.n * 17, 10) / 100)
        ),
        2
    ) AS SalesAmount,

    ROUND(
        p.UnitCost * (1 + MOD(o.OrderKey + item.n * 3, 5)),
        2
    ) AS CostAmount,

    ROUND(
        (
            (
                p.UnitPrice * (1 + MOD(o.OrderKey + item.n * 3, 5))
            )
            -
            (
                (p.UnitPrice * (1 + MOD(o.OrderKey + item.n * 3, 5)))
                * (MOD(o.OrderKey + item.n * 17, 10) / 100)
            )
        )
        -
        (
            p.UnitCost * (1 + MOD(o.OrderKey + item.n * 3, 5))
        ),
        2
    ) AS ProfitAmount

FROM fact_orders o

CROSS JOIN
(
    SELECT 1 AS n
    UNION ALL
    SELECT 2
    UNION ALL
    SELECT 3
    UNION ALL
    SELECT 4
) item

JOIN dim_product p
    ON p.ProductKey =
       1 + MOD(o.OrderKey * 7 + item.n * 11, 50)

WHERE item.n <=
    CASE
        WHEN MOD(o.OrderKey, 10) < 4 THEN 1
        WHEN MOD(o.OrderKey, 10) < 7 THEN 2
        WHEN MOD(o.OrderKey, 10) < 9 THEN 3
        ELSE 4
    END;