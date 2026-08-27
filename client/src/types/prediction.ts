export interface RevenueForecastPoint {
  Year: number;
  Month: number;
  MonthName: string;
  ActualValue: number | null;
  PredictedValue: number | null;
  ConfidenceLower: number | null;
  ConfidenceUpper: number | null;
  DataType: "actual" | "forecast";
  ModelName?: string;
  GeneratedAt?: string;
}

export interface RevenueForecastResponse {
  forecast: RevenueForecastPoint[];
  metadata: {
    modelName: string;
    lastGenerated: string | null;
    forecastHorizonMonths: number;
  };
}

export interface ProductDemandForecast {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category?: string;
  Brand?: string;
  Forecasts: ProductDemandPoint[];
  TotalPredictedDemand: number;
}

export interface ProductDemandPoint {
  Period: string;
  PredictedValue: number;
  ConfidenceLower: number | null;
  ConfidenceUpper: number | null;
}

export interface ProductDemandForecastResponse {
  products: ProductDemandForecast[];
  metadata: {
    modelName: string;
    lastGenerated: string | null;
    forecastHorizonMonths: number;
    totalProducts: number;
  };
}

export interface ForecastMetadataItem {
  ForecastType: string;
  ModelName: string;
  LastGenerated: string;
  RowCount: number;
  FirstPeriod: string;
  LastPeriod: string;
}

export interface ForecastMetadataResponse {
  data: Array<{
    ForecastType: string;
    ModelName: string;
    LastGenerated: string;
    RowCount: number;
    FirstPeriod: string;
    LastPeriod: string;
  }>;
}