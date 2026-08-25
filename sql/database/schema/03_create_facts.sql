-- ============================================================
-- ShopSphere 360
-- Fact Tables
-- MySQL 8.0
-- ============================================================

USE shopsphere360;


-- ============================================================
-- FACT_ORDERS
-- Grain: One row per customer order
-- ============================================================

CREATE TABLE fact_orders (
    OrderKey BIGINT AUTO_INCREMENT PRIMARY KEY,
    OrderID VARCHAR(30) NOT NULL UNIQUE,

    CustomerKey INT NOT NULL,
    DateKey INT NOT NULL,
    ChannelKey INT NOT NULL,
    LocationKey INT NOT NULL,

    OrderStatus VARCHAR(50) NOT NULL,
    PaymentStatus VARCHAR(50) NOT NULL,
    ShippingStatus VARCHAR(50) NOT NULL,

    OrderTotal DECIMAL(14,2) NOT NULL,
    DiscountAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(14,2) NOT NULL DEFAULT 0,
    ShippingAmount DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (CustomerKey)
        REFERENCES dim_customer(CustomerKey),

    CONSTRAINT fk_orders_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT fk_orders_channel
        FOREIGN KEY (ChannelKey)
        REFERENCES dim_channel(ChannelKey),

    CONSTRAINT fk_orders_location
        FOREIGN KEY (LocationKey)
        REFERENCES dim_location(LocationKey),

    CONSTRAINT chk_orders_total
        CHECK (OrderTotal >= 0),

    CONSTRAINT chk_orders_discount
        CHECK (DiscountAmount >= 0),

    CONSTRAINT chk_orders_tax
        CHECK (TaxAmount >= 0),

    CONSTRAINT chk_orders_shipping
        CHECK (ShippingAmount >= 0)
);


-- ============================================================
-- FACT_ORDER_ITEMS
-- Grain: One row per product within an order
-- ============================================================

CREATE TABLE fact_order_items (
    OrderItemKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    OrderKey BIGINT NOT NULL,
    ProductKey INT NOT NULL,

    Quantity INT NOT NULL,
    UnitPrice DECIMAL(12,2) NOT NULL,
    DiscountAmount DECIMAL(12,2) NOT NULL DEFAULT 0,
    SalesAmount DECIMAL(14,2) NOT NULL,
    CostAmount DECIMAL(14,2) NOT NULL,
    ProfitAmount DECIMAL(14,2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (OrderKey)
        REFERENCES fact_orders(OrderKey),

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (ProductKey)
        REFERENCES dim_product(ProductKey),

    CONSTRAINT chk_order_items_quantity
        CHECK (Quantity > 0),

    CONSTRAINT chk_order_items_price
        CHECK (UnitPrice >= 0),

    CONSTRAINT chk_order_items_discount
        CHECK (DiscountAmount >= 0)
);


-- ============================================================
-- FACT_PAYMENTS
-- Grain: One row per payment transaction
-- ============================================================

CREATE TABLE fact_payments (
    PaymentKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    OrderKey BIGINT NOT NULL,
    DateKey INT NOT NULL,

    PaymentMethod VARCHAR(50) NOT NULL,
    PaymentAmount DECIMAL(14,2) NOT NULL,
    PaymentStatus VARCHAR(50) NOT NULL,
    TransactionFee DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_payments_order
        FOREIGN KEY (OrderKey)
        REFERENCES fact_orders(OrderKey),

    CONSTRAINT fk_payments_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT chk_payment_amount
        CHECK (PaymentAmount >= 0),

    CONSTRAINT chk_transaction_fee
        CHECK (TransactionFee >= 0)
);


-- ============================================================
-- FACT_SHIPMENTS
-- Grain: One row per shipment
-- ============================================================

CREATE TABLE fact_shipments (
    ShipmentKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    OrderKey BIGINT NOT NULL,
    DateKey INT NOT NULL,

    ShippingMethod VARCHAR(50) NOT NULL,
    ShippingCost DECIMAL(12,2) NOT NULL,
    ShipmentStatus VARCHAR(50) NOT NULL,

    ShippedDate DATE,
    DeliveredDate DATE,
    DeliveryDays INT,

    CONSTRAINT fk_shipments_order
        FOREIGN KEY (OrderKey)
        REFERENCES fact_orders(OrderKey),

    CONSTRAINT fk_shipments_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT chk_shipping_cost
        CHECK (ShippingCost >= 0),

    CONSTRAINT chk_delivery_days
        CHECK (DeliveryDays IS NULL OR DeliveryDays >= 0)
);


-- ============================================================
-- FACT_RETURNS
-- Grain: One row per returned order item
-- ============================================================

CREATE TABLE fact_returns (
    ReturnKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    OrderKey BIGINT NOT NULL,
    CustomerKey INT NOT NULL,
    ProductKey INT NOT NULL,
    DateKey INT NOT NULL,

    QuantityReturned INT NOT NULL,
    RefundAmount DECIMAL(14,2) NOT NULL,
    ReturnReason VARCHAR(150) NOT NULL,

    CONSTRAINT fk_returns_order
        FOREIGN KEY (OrderKey)
        REFERENCES fact_orders(OrderKey),

    CONSTRAINT fk_returns_customer
        FOREIGN KEY (CustomerKey)
        REFERENCES dim_customer(CustomerKey),

    CONSTRAINT fk_returns_product
        FOREIGN KEY (ProductKey)
        REFERENCES dim_product(ProductKey),

    CONSTRAINT fk_returns_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT chk_return_quantity
        CHECK (QuantityReturned > 0),

    CONSTRAINT chk_refund_amount
        CHECK (RefundAmount >= 0)
);


-- ============================================================
-- FACT_MARKETING
-- Grain: One campaign/channel/date combination
-- ============================================================

CREATE TABLE fact_marketing (
    MarketingKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    CampaignKey INT NOT NULL,
    DateKey INT NOT NULL,
    ChannelKey INT NOT NULL,

    Impressions INT NOT NULL DEFAULT 0,
    Clicks INT NOT NULL DEFAULT 0,
    Leads INT NOT NULL DEFAULT 0,
    Conversions INT NOT NULL DEFAULT 0,

    Spend DECIMAL(14,2) NOT NULL DEFAULT 0,
    AttributedRevenue DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT fk_marketing_campaign
        FOREIGN KEY (CampaignKey)
        REFERENCES dim_campaign(CampaignKey),

    CONSTRAINT fk_marketing_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT fk_marketing_channel
        FOREIGN KEY (ChannelKey)
        REFERENCES dim_channel(ChannelKey),

    CONSTRAINT chk_marketing_impressions
        CHECK (Impressions >= 0),

    CONSTRAINT chk_marketing_clicks
        CHECK (Clicks >= 0),

    CONSTRAINT chk_marketing_leads
        CHECK (Leads >= 0),

    CONSTRAINT chk_marketing_conversions
        CHECK (Conversions >= 0),

    CONSTRAINT chk_marketing_spend
        CHECK (Spend >= 0),

    CONSTRAINT chk_marketing_revenue
        CHECK (AttributedRevenue >= 0)
);


-- ============================================================
-- FACT_REVIEWS
-- Grain: One row per customer review
-- ============================================================

CREATE TABLE fact_reviews (
    ReviewKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    CustomerKey INT NOT NULL,
    ProductKey INT NOT NULL,
    DateKey INT NOT NULL,

    Rating INT NOT NULL,
    ReviewSentiment VARCHAR(20),
    ReviewText TEXT,

    CONSTRAINT fk_reviews_customer
        FOREIGN KEY (CustomerKey)
        REFERENCES dim_customer(CustomerKey),

    CONSTRAINT fk_reviews_product
        FOREIGN KEY (ProductKey)
        REFERENCES dim_product(ProductKey),

    CONSTRAINT fk_reviews_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT chk_review_rating
        CHECK (Rating BETWEEN 1 AND 5)
);


-- ============================================================
-- FACT_SUPPORT
-- Grain: One row per customer support ticket
-- ============================================================

CREATE TABLE fact_support (
    SupportKey BIGINT AUTO_INCREMENT PRIMARY KEY,

    CustomerKey INT NOT NULL,
    DateKey INT NOT NULL,

    TicketID VARCHAR(30) NOT NULL UNIQUE,
    IssueType VARCHAR(100) NOT NULL,
    Priority VARCHAR(30) NOT NULL,
    ResolutionTimeHours DECIMAL(10,2),
    SatisfactionScore DECIMAL(5,2),
    Status VARCHAR(50) NOT NULL,

    CONSTRAINT fk_support_customer
        FOREIGN KEY (CustomerKey)
        REFERENCES dim_customer(CustomerKey),

    CONSTRAINT fk_support_date
        FOREIGN KEY (DateKey)
        REFERENCES dim_date(DateKey),

    CONSTRAINT chk_resolution_time
        CHECK (
            ResolutionTimeHours IS NULL
            OR ResolutionTimeHours >= 0
        ),

    CONSTRAINT chk_satisfaction
        CHECK (
            SatisfactionScore IS NULL
            OR SatisfactionScore BETWEEN 0 AND 5
        )
);