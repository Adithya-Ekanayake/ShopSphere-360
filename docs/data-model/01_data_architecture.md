# ShopSphere 360 — Data Architecture

## 1. Purpose

The ShopSphere 360 data architecture defines how operational business data will be organized, integrated, transformed, and consumed for analytical reporting.

The architecture is designed to support:

- Business analysis
- SQL analytics
- Python analytics
- Customer segmentation
- RFM analysis
- Marketing analytics
- Sales analytics
- Customer experience analytics
- Power BI dashboards

---

## 2. High-Level Architecture

**Source Data → Data Ingestion → Data Cleaning & Transformation → Analytical Model → SQL / Python / Power BI → Business Insights**

### Source Data

- Sales Data
- Customer Data
- Product Data
- Marketing Data
- Returns Data
- Support Data
- Reviews Data

### Analytical Flow

1. Source Data
2. Data Ingestion
3. Data Validation
4. Data Cleaning
5. Data Transformation
6. Analytical Data Model
7. SQL Analysis
8. Python Analysis
9. Power BI Semantic Model
10. Dashboard Development
11. Business Insights
12. Recommendations

---

## 3. Data Sources

The ShopSphere 360 analytical environment will contain simulated e-commerce business data representing multiple operational domains.

### Primary Data Domains

| Domain | Description |
|---|---|
| Customers | Customer profiles and demographic information |
| Products | Product catalogue and pricing information |
| Sales | Customer transactions and order details |
| Returns | Product returns and refund information |
| Marketing | Campaign performance and acquisition data |
| Support | Customer service interactions |
| Reviews | Customer ratings and feedback |
| Channels | Sales channel information |
| Locations | Geographic information |

---

## 4. Data Processing Layers

### 4.1 Raw Layer

The raw layer contains source data in its original structure.

**Directory:**

`data/raw/`

No analytical transformations should be performed directly on the raw data.

### 4.2 Processed Layer

The processed layer contains cleaned and standardized datasets.

**Directory:**

`data/processed/`

Typical transformations include:

- Removing duplicates
- Handling missing values
- Standardizing dates
- Standardizing categories
- Validating identifiers
- Handling invalid transactions
- Creating derived attributes

### 4.3 Analytical Layer

The analytical layer contains data structured specifically for reporting and analysis.

The primary modeling approach will be a **Star Schema**.

---

## 5. Star Schema

The central fact table will be:

**FACT_SALES**

The fact table will connect to multiple dimension tables.

### Core Analytical Model

| Dimension | Relationship | Fact |
|---|---|---|
| DIM_CUSTOMER | 1 → Many | FACT_SALES |
| DIM_PRODUCT | 1 → Many | FACT_SALES |
| DIM_DATE | 1 → Many | FACT_SALES |
| DIM_CHANNEL | 1 → Many | FACT_SALES |
| DIM_LOCATION | 1 → Many | FACT_SALES |

### Conceptual Structure

**DIM_CUSTOMER → FACT_SALES ← DIM_PRODUCT**

**DIM_DATE → FACT_SALES ← DIM_CHANNEL**

**DIM_LOCATION → FACT_SALES**

---

## 6. Fact Tables

Fact tables contain measurable business events and numerical metrics.

### 6.1 FACT_SALES

Stores individual sales transaction records.

#### Key Fields

| Field | Description |
|---|---|
| SalesKey | Unique sales record identifier |
| OrderID | Unique order identifier |
| CustomerKey | Customer reference |
| ProductKey | Product reference |
| DateKey | Date reference |
| ChannelKey | Sales channel reference |
| LocationKey | Location reference |
| Quantity | Number of units sold |
| UnitPrice | Selling price per unit |
| DiscountAmount | Discount applied |
| SalesAmount | Final transaction revenue |
| CostAmount | Product cost |
| ProfitAmount | Profit generated |

### 6.2 FACT_RETURNS

Stores product return transactions.

#### Key Fields

| Field | Description |
|---|---|
| ReturnKey | Unique return identifier |
| OrderID | Related order |
| CustomerKey | Customer reference |
| ProductKey | Product reference |
| DateKey | Return date |
| QuantityReturned | Number of returned units |
| RefundAmount | Refund value |
| ReturnReason | Reason for return |

### 6.3 FACT_MARKETING

Stores marketing campaign performance.

#### Key Fields

| Field | Description |
|---|---|
| MarketingKey | Unique marketing record |
| CampaignKey | Campaign reference |
| DateKey | Campaign date |
| ChannelKey | Marketing channel |
| Impressions | Number of impressions |
| Clicks | Number of clicks |
| Leads | Number of leads |
| Conversions | Number of conversions |
| Spend | Marketing expenditure |
| AttributedRevenue | Revenue attributed to campaign |

### 6.4 FACT_SUPPORT

Stores customer support interactions.

#### Key Fields

| Field | Description |
|---|---|
| SupportKey | Unique support record |
| CustomerKey | Customer reference |
| DateKey | Ticket date |
| TicketID | Support ticket identifier |
| IssueType | Type of issue |
| Priority | Ticket priority |
| ResolutionTimeHours | Resolution duration |
| SatisfactionScore | Customer satisfaction |
| Status | Ticket status |

### 6.5 FACT_REVIEWS

Stores customer product reviews.

#### Key Fields

| Field | Description |
|---|---|
| ReviewKey | Unique review identifier |
| CustomerKey | Customer reference |
| ProductKey | Product reference |
| DateKey | Review date |
| Rating | Rating from customer |
| ReviewSentiment | Positive / Neutral / Negative |
| ReviewText | Customer review |

---

## 7. Dimension Tables

Dimension tables provide descriptive attributes used to filter, group, and analyze fact data.

### 7.1 DIM_CUSTOMER

Stores customer attributes.

| Field | Description |
|---|---|
| CustomerKey | Surrogate customer key |
| CustomerID | Business customer identifier |
| FirstName | Customer first name |
| LastName | Customer last name |
| Gender | Customer gender |
| Age | Customer age |
| SignupDate | Account creation date |
| CustomerSegment | Customer segment |
| AcquisitionChannel | Original acquisition source |
| City | Customer city |
| Country | Customer country |

### 7.2 DIM_PRODUCT

Stores product attributes.

| Field | Description |
|---|---|
| ProductKey | Surrogate product key |
| ProductID | Business product identifier |
| ProductName | Product name |
| Category | Product category |
| Subcategory | Product subcategory |
| Brand | Product brand |
| Supplier | Product supplier |
| UnitCost | Product cost |
| UnitPrice | Standard selling price |

### 7.3 DIM_DATE

Provides the calendar structure required for time-based analysis.

| Field | Description |
|---|---|
| DateKey | Date key |
| FullDate | Calendar date |
| Day | Day number |
| Month | Month number |
| MonthName | Month name |
| Quarter | Quarter |
| Year | Year |
| Week | Week number |
| DayOfWeek | Day of week |
| IsWeekend | Weekend indicator |

### 7.4 DIM_CHANNEL

Stores sales and marketing channels.

| Field | Description |
|---|---|
| ChannelKey | Channel identifier |
| ChannelName | Channel name |
| ChannelType | Online / Offline |
| Platform | Platform name |

### 7.5 DIM_LOCATION

Stores geographic information.

| Field | Description |
|---|---|
| LocationKey | Location identifier |
| City | City |
| Region | Region |
| Country | Country |
| Continent | Continent |

### 7.6 DIM_CAMPAIGN

Stores marketing campaign information.

| Field | Description |
|---|---|
| CampaignKey | Campaign identifier |
| CampaignID | Business campaign ID |
| CampaignName | Campaign name |
| CampaignType | Campaign category |
| Objective | Campaign objective |
| StartDate | Campaign start date |
| EndDate | Campaign end date |
| Budget | Campaign budget |

---

## 8. Relationships

The analytical model follows a one-to-many relationship pattern.

| Parent Table | Relationship | Child Table |
|---|---|---|
| DIM_CUSTOMER | 1 → Many | FACT_SALES |
| DIM_PRODUCT | 1 → Many | FACT_SALES |
| DIM_DATE | 1 → Many | FACT_SALES |
| DIM_CHANNEL | 1 → Many | FACT_SALES |
| DIM_LOCATION | 1 → Many | FACT_SALES |
| DIM_CUSTOMER | 1 → Many | FACT_RETURNS |
| DIM_PRODUCT | 1 → Many | FACT_RETURNS |
| DIM_DATE | 1 → Many | FACT_RETURNS |
| DIM_CAMPAIGN | 1 → Many | FACT_MARKETING |
| DIM_CHANNEL | 1 → Many | FACT_MARKETING |
| DIM_DATE | 1 → Many | FACT_MARKETING |
| DIM_CUSTOMER | 1 → Many | FACT_SUPPORT |
| DIM_DATE | 1 → Many | FACT_SUPPORT |
| DIM_CUSTOMER | 1 → Many | FACT_REVIEWS |
| DIM_PRODUCT | 1 → Many | FACT_REVIEWS |
| DIM_DATE | 1 → Many | FACT_REVIEWS |

---

## 9. Modeling Principles

The analytical model will follow these principles.

### 9.1 Single Source of Truth

Business metrics should be calculated from standardized analytical data.

### 9.2 Star Schema

Fact and dimension tables should be separated to improve analytical performance and usability.

### 9.3 Surrogate Keys

Dimension tables will use surrogate keys to provide stable relationships.

### 9.4 Consistent Dimensions

Shared dimensions such as Date, Customer, and Product should be reused across fact tables where appropriate.

### 9.5 Data Quality

Relationships should not contain unexpected orphan records.

### 9.6 Scalability

The model should allow additional fact tables and dimensions to be introduced without redesigning the entire analytical environment.

---

## 10. Analytical Benefits

The architecture supports:

- Fast Power BI reporting
- Flexible slicing and filtering
- Time-series analysis
- Customer segmentation
- Product analysis
- Marketing analysis
- Profitability analysis
- Customer retention analysis
- Cross-domain analysis
- Executive-level reporting
- Operational-level reporting

---

## 11. Analytical Workflow

**Raw Data**

↓

**Data Validation**

↓

**Data Cleaning**

↓

**Data Transformation**

↓

**Star Schema**

↓

**SQL Analysis**

↓

**Python Analysis**

↓

**Power BI Semantic Model**

↓

**Dashboards**

↓

**Business Insights**

↓

**Recommendations**

---

## 12. Data Quality Controls

The analytical pipeline should validate the following:

| Check | Description |
|---|---|
| Missing Values | Identify missing critical fields |
| Duplicates | Identify duplicate business records |
| Referential Integrity | Validate foreign-key relationships |
| Invalid Dates | Identify invalid or future dates |
| Invalid Quantities | Identify impossible quantities |
| Invalid Prices | Identify invalid pricing values |
| Orphan Records | Identify records without matching dimensions |
| Calculation Accuracy | Validate derived financial metrics |

---

## 13. Architecture Success Criteria

The data architecture will be considered complete when:

- All major business domains are represented.
- Fact and dimension tables are clearly defined.
- Relationships are documented.
- Business KPIs can be calculated from the model.
- The model supports Power BI reporting.
- Data quality rules are documented.
- The model can support future analytical extensions.
- The model provides a consistent foundation for SQL, Python, and Power BI analysis.

---

## 14. Future Extensions

The architecture can be extended with:

- Inventory analytics
- Supplier performance
- Delivery analytics
- Customer loyalty programs
- Fraud detection
- Recommendation systems
- Forecasting
- Customer churn prediction
- Product demand forecasting
- Advanced machine learning models