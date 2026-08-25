USE shopsphere360;

CREATE OR REPLACE VIEW vw_returns_analytics AS
SELECT
    r.ReturnKey,
    r.OrderKey,
    o.OrderID,

    r.CustomerKey,
    CONCAT(c.FirstName, ' ', c.LastName) AS CustomerName,

    r.ProductKey,
    p.ProductID,
    p.ProductName,
    p.Category,
    p.Subcategory,
    p.Brand,

    r.DateKey,
    d.FullDate,
    d.Year,
    d.Month,
    d.MonthName,

    r.QuantityReturned,
    r.RefundAmount,
    r.ReturnReason,

    o.OrderStatus,
    o.PaymentStatus

FROM fact_returns r

JOIN fact_orders o
    ON r.OrderKey = o.OrderKey

JOIN dim_customer c
    ON r.CustomerKey = c.CustomerKey

JOIN dim_product p
    ON r.ProductKey = p.ProductKey

JOIN dim_date d
    ON r.DateKey = d.DateKey;


SELECT *
FROM vw_returns_analytics
ORDER BY RefundAmount DESC;