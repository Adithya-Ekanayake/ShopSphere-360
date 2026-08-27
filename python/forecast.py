#!/usr/bin/env python3
"""
ShopSphere 360 - Forecasting Script
====================================

This script computes batch forecasts and stores them in the `fact_forecast` table.

Approach:
- Monthly Revenue: Holt-Winters (Exponential Smoothing) with trend + seasonality
- Product Demand: Simple Moving Average or Holt-Winters per product (top N by volume)

Method rationale:
- Holt-Winters (Exponential Smoothing) handles trend and seasonality well for monthly data
- No external heavy dependencies beyond statsmodels (lightweight, well-tested)
- Explainable: trend + seasonal components are interpretable
- Batch-computed: run manually or on schedule (monthly), not real-time

Assumptions:
- No major structural breaks in the time series
- Seasonality is annual (monthly data -> seasonal_period=12)
- Recalculate monthly as new data arrives
- Prediction intervals use the model's built-in confidence intervals (95%)

Environment: uses python/.env with DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT
"""

import os
import sys
import warnings
from datetime import datetime, date
from dateutil.relativedelta import relativedelta

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from dotenv import load_dotenv

# Suppress statsmodels convergence warnings for cleaner output
warnings.filterwarnings("ignore", category=UserWarning, module="statsmodels")

# ─── Configuration ──────────────────────────────────────────────
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "shopsphere360")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

FORECAST_HORIZON_MONTHS = 6          # months to forecast ahead
TOP_N_PRODUCTS = 20                  # number of products to forecast demand for
MIN_HISTORY_MONTHS = 24              # minimum months of history required

# ─── Database Connection ────────────────────────────────────────
def get_engine():
    """Create SQLAlchemy engine for MySQL."""
    url = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    return create_engine(url, pool_pre_ping=True)

# ─── Data Fetching ──────────────────────────────────────────────
def fetch_monthly_revenue_history(engine):
    """Fetch monthly revenue history from vw_monthly_sales."""
    query = text("""
        SELECT 
            Year, 
            Month, 
            MonthName,
            Revenue,
            Profit,
            TotalOrders,
            UnitsSold,
            ProfitMarginPercent,
            AverageOrderValue
        FROM vw_monthly_sales
        ORDER BY Year, Month
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn)
    return df

def fetch_product_demand_history(engine, top_n=20):
    """Fetch per-product monthly demand (quantity) history for top N products by total volume."""
    query = text("""
        WITH product_volume AS (
            SELECT 
                p.ProductKey,
                p.ProductID,
                p.ProductName,
                SUM(oi.Quantity) AS total_volume
            FROM fact_order_items oi
            JOIN fact_orders o ON oi.OrderKey = o.OrderKey
            JOIN dim_product p ON oi.ProductKey = p.ProductKey
            WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
            GROUP BY p.ProductKey, p.ProductID, p.ProductName
            ORDER BY total_volume DESC
            LIMIT :top_n
        ),
        product_monthly AS (
            SELECT 
                p.ProductKey,
                p.ProductID,
                p.ProductName,
                d.Year,
                d.Month,
                SUM(oi.Quantity) AS MonthlyQuantity
            FROM fact_order_items oi
            JOIN fact_orders o ON oi.OrderKey = o.OrderKey
            JOIN dim_product p ON oi.ProductKey = p.ProductKey
            JOIN dim_date d ON o.DateKey = d.DateKey
            WHERE o.OrderStatus NOT IN ('Cancelled', 'Returned')
            AND p.ProductKey IN (SELECT ProductKey FROM product_volume)
            GROUP BY p.ProductKey, p.ProductID, p.ProductName, d.Year, d.Month
        )
        SELECT 
            ProductKey,
            ProductID,
            ProductName,
            Year,
            Month,
            MonthlyQuantity
        FROM product_monthly
        ORDER BY ProductKey, Year, Month
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"top_n": TOP_N_PRODUCTS})
    return df

# ─── Forecasting Functions ──────────────────────────────────────
def prepare_time_series(df, value_col, date_col_year="Year", date_col_month="Month"):
    """Convert Year/Month columns to a proper datetime index for time series."""
    df = df.copy()
    df["ds"] = pd.to_datetime(
        df[date_col_year].astype(str) + "-" + df[date_col_month].astype(str).str.zfill(2) + "-01"
    )
    df = df.set_index("ds").sort_index()
    # Ensure monthly frequency
    ts = df[value_col].asfreq("MS")
    return ts

def fit_holt_winters(ts, seasonal_periods=12):
    """
    Fit Holt-Winters (Exponential Smoothing) with trend and seasonality.
    Returns fitted model.
    """
    if len(ts) < MIN_HISTORY_MONTHS:
        raise ValueError(f"Insufficient history: {len(ts)} months (need >= {MIN_HISTORY_MONTHS})")
    
    # Use multiplicative seasonality for revenue (scales with level)
    # Use additive for product quantity (more stable)
    model = ExponentialSmoothing(
        ts,
        trend="add",
        seasonal="mul",
        seasonal_periods=12,
        initialization_method="estimated",
    )
    fitted = model.fit(optimized=True)
    return fitted

def forecast_next_months(fitted_model, horizon):
    """Generate forecast with confidence intervals.
    
    Note: In newer statsmodels versions, HoltWintersResults uses .forecast() 
    instead of .get_forecast(). We compute prediction intervals manually
    using the model's residual variance.
    """
    mean = fitted_model.forecast(steps=horizon)
    
    # Compute prediction intervals manually using residual variance
    # For Holt-Winters, prediction intervals are approximate
    residuals = fitted_model.resid
    if len(residuals) > 0:
        resid_std = np.std(residuals, ddof=1)
        # Prediction interval width grows with horizon (approximate)
        z = 1.96  # 95% CI
        pred_std = resid_std * np.sqrt(np.arange(1, horizon + 1))
        margin = z * pred_std
        
        lower = mean - margin
        upper = mean + margin
    else:
        lower = mean
        upper = mean
    
    return mean, pd.DataFrame({"lower": lower, "upper": upper})

def forecast_revenue(engine, horizon=FORECAST_HORIZON_MONTHS):
    """Generate monthly revenue forecast."""
    print("Fetching monthly revenue history...")
    df = fetch_monthly_revenue_history(engine)
    
    if df.empty:
        print("No revenue history found.")
        return pd.DataFrame()
    
    print(f"Found {len(df)} months of revenue history.")
    ts = prepare_time_series(df, "Revenue")
    print(f"Time series range: {ts.index.min()} to {ts.index.max()}")
    
    print("Fitting Holt-Winters model...")
    fitted = fit_holt_winters(ts)
    print(f"Model fitted. AIC: {fitted.aic:.2f}")
    
    print(f"Forecasting next {FORECAST_HORIZON_MONTHS} months...")
    mean, conf_int = forecast_next_months(fitted, horizon)
    
    # Build result DataFrame
    result = pd.DataFrame({
        "PeriodLabel": mean.index,
        "PredictedValue": mean.values,
        "ConfidenceLower": conf_int.iloc[:, 0].values,
        "ConfidenceUpper": conf_int.iloc[:, 1].values,
    })
    result["ForecastType"] = "monthly_revenue"
    result["ProductKey"] = None
    result["ModelName"] = "HoltWinters"
    result["GeneratedAt"] = datetime.now()
    
    # Add actuals for reference (last N months)
    actuals = df.tail(12).copy()
    actuals["ds"] = pd.to_datetime(
        actuals["Year"].astype(str) + "-" + actuals["Month"].astype(str).str.zfill(2) + "-01"
    )
    actuals = actuals.set_index("ds")
    
    return result, actuals["Revenue"]

def forecast_product_demand(engine, horizon=FORECAST_HORIZON_MONTHS, top_n=TOP_N_PRODUCTS):
    """Generate per-product demand forecast for top N products."""
    print("Fetching product demand history...")
    df = fetch_product_demand_history(engine, top_n=top_n)
    
    if df.empty:
        print("No product demand history found.")
        return pd.DataFrame()
    
    product_keys = df["ProductKey"].unique()
    print(f"Found {len(product_keys)} products with history.")
    
    all_forecasts = []
    
    for pk in product_keys:
        product_df = df[df["ProductKey"] == pk].copy()
        product_name = product_df["ProductName"].iloc[0]
        product_id = product_df["ProductID"].iloc[0]
        
        ts = prepare_time_series(product_df, "MonthlyQuantity")
        
        if len(ts) < 12:
            print(f"  Skipping {product_id} ({product_name}): insufficient history ({len(ts)} months)")
            continue
        
        try:
            fitted = fit_holt_winters(ts, seasonal_periods=12)
            mean, conf_int = forecast_next_months(fitted, horizon)
            
            for i in range(horizon):
                period = mean.index[i]
                all_forecasts.append({
                    "PeriodLabel": period,
                    "ProductKey": int(pk),
                    "PredictedValue": max(0, mean.iloc[i]),  # no negative demand
                    "ConfidenceLower": max(0, conf_int.iloc[i, 0]),
                    "ConfidenceUpper": max(0, conf_int.iloc[i, 1]),
                    "ForecastType": "product_demand",
                    "ModelName": "HoltWinters",
                    "GeneratedAt": datetime.now(),
                })
            print(f"  Forecasted {product_id} ({product_name}): {len(mean)} months")
        except Exception as e:
            print(f"  Error forecasting {product_id} ({product_name}): {e}")
            continue
    
    if not all_forecasts:
        return pd.DataFrame()
    
    result = pd.DataFrame(all_forecasts)
    result["ForecastType"] = "product_demand"
    result["ModelName"] = "HoltWinters"
    result["GeneratedAt"] = datetime.now()
    
    return result

# ─── Database Write ─────────────────────────────────────────────
def clear_forecast_type(engine, forecast_type):
    """Delete existing forecasts for a given type before inserting new ones."""
    with engine.begin() as conn:
        conn.execute(
            text("DELETE FROM fact_forecast WHERE ForecastType = :ft"),
            {"ft": forecast_type}
        )
        print(f"Cleared existing forecasts for type: {forecast_type}")

def insert_forecasts(engine, df):
    """Bulk insert forecasts into fact_forecast."""
    if df.empty:
        print("No forecasts to insert.")
        return 0
    
    cols = [
        "ForecastType", "PeriodLabel", "ProductKey", "PredictedValue",
        "ConfidenceLower", "ConfidenceUpper", "ModelName", "GeneratedAt"
    ]
    
    # Ensure correct column order and types
    insert_df = df[cols].copy()
    insert_df["PeriodLabel"] = pd.to_datetime(insert_df["PeriodLabel"]).dt.date
    insert_df["GeneratedAt"] = pd.to_datetime(insert_df["GeneratedAt"])
    
    with engine.begin() as conn:
        insert_df.to_sql(
            "fact_forecast",
            con=conn,
            if_exists="append",
            index=False,
            chunksize=1000,
            method="multi"
        )
    
    print(f"Inserted {len(insert_df)} forecast rows.")
    return len(insert_df)

# ─── Main ───────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("ShopSphere 360 - Forecasting Script")
    print("=" * 60)
    print(f"Started at: {datetime.now().isoformat()}")
    print(f"Database: {DB_HOST}:{DB_PORT}/{DB_NAME}")
    print()
    
    engine = get_engine()
    
    try:
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Database connection OK.")
        print()
        
        # ── Revenue Forecast ──
        print("-" * 60)
        print("REVENUE FORECAST")
        print("-" * 60)
        clear_forecast_type(engine, "monthly_revenue")
        revenue_forecasts, revenue_actuals = forecast_revenue(engine)
        
        if not revenue_forecasts.empty:
            inserted = insert_forecasts(engine, revenue_forecasts)
            print(f"Revenue forecast: {inserted} rows inserted.")
            print(f"  Forecast range: {revenue_forecasts['PeriodLabel'].min()} to {revenue_forecasts['PeriodLabel'].max()}")
            print(f"  Predicted next month: {revenue_forecasts.iloc[0]['PredictedValue']:,.2f}")
        else:
            print("No revenue forecasts generated.")
        print()
        
        # ── Product Demand Forecast ──
        print("-" * 60)
        print("PRODUCT DEMAND FORECAST")
        print("-" * 60)
        clear_forecast_type(engine, "product_demand")
        product_forecasts = forecast_product_demand(engine)
        
        if not product_forecasts.empty:
            inserted = insert_forecasts(engine, product_forecasts)
            print(f"Product demand forecast: {inserted} rows inserted.")
            print(f"  Products forecasted: {product_forecasts['ProductKey'].nunique()}")
            print(f"  Horizon: {FORECAST_HORIZON_MONTHS} months")
        else:
            print("No product demand forecasts generated.")
        print()
        
        print("=" * 60)
        print(f"Completed at: {datetime.now().isoformat()}")
        print("=" * 60)
        
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        engine.dispose()

if __name__ == "__main__":
    main()