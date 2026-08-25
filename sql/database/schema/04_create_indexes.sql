USE shopsphere360;

-- Orders
CREATE INDEX idx_orders_customer
ON fact_orders(CustomerKey);

CREATE INDEX idx_orders_date
ON fact_orders(DateKey);

CREATE INDEX idx_orders_channel
ON fact_orders(ChannelKey);

CREATE INDEX idx_orders_location
ON fact_orders(LocationKey);


-- Order Items
CREATE INDEX idx_order_items_order
ON fact_order_items(OrderKey);

CREATE INDEX idx_order_items_product
ON fact_order_items(ProductKey);


-- Payments
CREATE INDEX idx_payments_order
ON fact_payments(OrderKey);

CREATE INDEX idx_payments_date
ON fact_payments(DateKey);


-- Shipments
CREATE INDEX idx_shipments_order
ON fact_shipments(OrderKey);

CREATE INDEX idx_shipments_date
ON fact_shipments(DateKey);


-- Returns
CREATE INDEX idx_returns_order
ON fact_returns(OrderKey);

CREATE INDEX idx_returns_customer
ON fact_returns(CustomerKey);

CREATE INDEX idx_returns_product
ON fact_returns(ProductKey);

CREATE INDEX idx_returns_date
ON fact_returns(DateKey);


-- Marketing
CREATE INDEX idx_marketing_campaign
ON fact_marketing(CampaignKey);

CREATE INDEX idx_marketing_date
ON fact_marketing(DateKey);

CREATE INDEX idx_marketing_channel
ON fact_marketing(ChannelKey);


-- Reviews
CREATE INDEX idx_reviews_customer
ON fact_reviews(CustomerKey);

CREATE INDEX idx_reviews_product
ON fact_reviews(ProductKey);

CREATE INDEX idx_reviews_date
ON fact_reviews(DateKey);


-- Support
CREATE INDEX idx_support_customer
ON fact_support(CustomerKey);

CREATE INDEX idx_support_date
ON fact_support(DateKey);