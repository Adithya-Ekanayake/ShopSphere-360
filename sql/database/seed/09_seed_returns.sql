USE shopsphere360;

INSERT INTO fact_returns
(
    OrderKey,
    CustomerKey,
    ProductKey,
    DateKey,
    QuantityReturned,
    RefundAmount,
    ReturnReason
)
SELECT
    o.OrderKey,
    o.CustomerKey,
    oi.ProductKey,
    o.DateKey,

    CASE
        WHEN oi.Quantity = 1 THEN 1
        ELSE 1 + MOD(o.OrderKey, oi.Quantity)
    END AS QuantityReturned,

    ROUND(
        oi.UnitPrice *
        CASE
            WHEN oi.Quantity = 1 THEN 1
            ELSE 1 + MOD(o.OrderKey, oi.Quantity)
        END
        * (1 - (oi.DiscountAmount /
            NULLIF(oi.UnitPrice * oi.Quantity, 0))),
        2
    ) AS RefundAmount,

    CASE MOD(o.OrderKey, 6)
        WHEN 0 THEN 'Damaged Product'
        WHEN 1 THEN 'Wrong Product'
        WHEN 2 THEN 'Product Not as Described'
        WHEN 3 THEN 'Changed Mind'
        WHEN 4 THEN 'Size or Fit Issue'
        ELSE 'Late Delivery'
    END AS ReturnReason

FROM fact_orders o

JOIN fact_order_items oi
    ON o.OrderKey = oi.OrderKey

WHERE
    MOD(o.OrderKey, 10) < 8
    AND MOD(oi.OrderItemKey, 20) = 0;