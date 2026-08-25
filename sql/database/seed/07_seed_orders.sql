USE shopsphere360;

INSERT INTO fact_orders
(
    OrderID,
    CustomerKey,
    DateKey,
    ChannelKey,
    LocationKey,
    OrderStatus,
    PaymentStatus,
    ShippingStatus,
    OrderTotal,
    DiscountAmount,
    TaxAmount,
    ShippingAmount
)
SELECT
    CONCAT('ORD-', LPAD(n, 6, '0')) AS OrderID,

    1 + MOD(n * 37, 500) AS CustomerKey,

    DATE_FORMAT(
        DATE_ADD('2023-01-01', INTERVAL MOD(n * 17, 1461) DAY),
        '%Y%m%d'
    ) + 0 AS DateKey,

    1 + MOD(n * 7, 9) AS ChannelKey,

    1 + MOD(n * 13, 20) AS LocationKey,

    CASE
        WHEN MOD(n, 100) < 82 THEN 'Completed'
        WHEN MOD(n, 100) < 88 THEN 'Shipped'
        WHEN MOD(n, 100) < 94 THEN 'Processing'
        WHEN MOD(n, 100) < 98 THEN 'Cancelled'
        ELSE 'Returned'
    END AS OrderStatus,

    CASE
        WHEN MOD(n, 100) < 92 THEN 'Paid'
        WHEN MOD(n, 100) < 97 THEN 'Pending'
        ELSE 'Failed'
    END AS PaymentStatus,

    CASE
        WHEN MOD(n, 100) < 78 THEN 'Delivered'
        WHEN MOD(n, 100) < 90 THEN 'Shipped'
        WHEN MOD(n, 100) < 97 THEN 'Processing'
        ELSE 'Cancelled'
    END AS ShippingStatus,

    1000.00 + MOD(n * 173, 49000) AS OrderTotal,

    MOD(n * 29, 1000) AS DiscountAmount,

    ROUND(
        (1000.00 + MOD(n * 173, 49000)) * 0.18,
        2
    ) AS TaxAmount,

    CASE
        WHEN MOD(n, 5) = 0 THEN 0.00
        WHEN MOD(n, 3) = 0 THEN 350.00
        ELSE 250.00
    END AS ShippingAmount

FROM
(
    SELECT
        a.n
        + b.n * 10
        + c.n * 100
        + d.n * 1000
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
    CROSS JOIN
        (SELECT 0 n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
         UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) d
) numbers
WHERE n <= 5000;