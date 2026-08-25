-- ============================================================
-- ShopSphere 360
-- Dimension Tables
-- ============================================================

USE shopsphere360;


-- ============================================================
-- DIM_DATE
-- One row represents one calendar date.
-- ============================================================

CREATE TABLE dim_date (
    DateKey INT PRIMARY KEY,
    FullDate DATE NOT NULL UNIQUE,
    Day INT NOT NULL,
    Month INT NOT NULL,
    MonthName VARCHAR(20) NOT NULL,
    Quarter INT NOT NULL,
    Year INT NOT NULL,
    Week INT NOT NULL,
    DayOfWeek VARCHAR(20) NOT NULL,
    IsWeekend BOOLEAN NOT NULL
);


-- ============================================================
-- DIM_CUSTOMER
-- One row represents one customer.
-- ============================================================

CREATE TABLE dim_customer (
    CustomerKey INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID VARCHAR(20) NOT NULL UNIQUE,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Gender VARCHAR(20),
    Age INT,
    SignupDate DATE NOT NULL,
    CustomerSegment VARCHAR(50),
    AcquisitionChannel VARCHAR(50),
    City VARCHAR(100),
    Country VARCHAR(100),
    
    CONSTRAINT chk_customer_age
        CHECK (Age IS NULL OR Age BETWEEN 13 AND 100)
);


-- ============================================================
-- DIM_PRODUCT
-- One row represents one product.
-- ============================================================

CREATE TABLE dim_product (
    ProductKey INT AUTO_INCREMENT PRIMARY KEY,
    ProductID VARCHAR(20) NOT NULL UNIQUE,
    ProductName VARCHAR(150) NOT NULL,
    Category VARCHAR(100) NOT NULL,
    Subcategory VARCHAR(100),
    Brand VARCHAR(100),
    Supplier VARCHAR(100),
    UnitCost DECIMAL(12,2) NOT NULL,
    UnitPrice DECIMAL(12,2) NOT NULL,

    CONSTRAINT chk_product_cost
        CHECK (UnitCost >= 0),

    CONSTRAINT chk_product_price
        CHECK (UnitPrice >= 0)
);


-- ============================================================
-- DIM_CHANNEL
-- One row represents one sales/marketing channel.
-- ============================================================

CREATE TABLE dim_channel (
    ChannelKey INT AUTO_INCREMENT PRIMARY KEY,
    ChannelName VARCHAR(100) NOT NULL UNIQUE,
    ChannelType VARCHAR(50) NOT NULL,
    Platform VARCHAR(100)
);


-- ============================================================
-- DIM_LOCATION
-- One row represents one geographic location.
-- ============================================================

CREATE TABLE dim_location (
    LocationKey INT AUTO_INCREMENT PRIMARY KEY,
    City VARCHAR(100) NOT NULL,
    Region VARCHAR(100),
    Country VARCHAR(100) NOT NULL,
    Continent VARCHAR(100) NOT NULL,

    UNIQUE (City, Country)
);


-- ============================================================
-- DIM_CAMPAIGN
-- One row represents one marketing campaign.
-- ============================================================

CREATE TABLE dim_campaign (
    CampaignKey INT AUTO_INCREMENT PRIMARY KEY,
    CampaignID VARCHAR(30) NOT NULL UNIQUE,
    CampaignName VARCHAR(150) NOT NULL,
    CampaignType VARCHAR(100) NOT NULL,
    Objective VARCHAR(150),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Budget DECIMAL(14,2) NOT NULL,

    CONSTRAINT chk_campaign_dates
        CHECK (EndDate >= StartDate),

    CONSTRAINT chk_campaign_budget
        CHECK (Budget >= 0)
);