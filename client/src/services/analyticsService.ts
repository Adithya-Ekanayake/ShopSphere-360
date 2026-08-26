import api from "./api";

export interface KPIData {
  TotalRevenue: number | string;
  TotalProfit: number | string;
  TotalOrders: number | string;
  TotalCustomers: number | string;
  AverageOrderValue: number | string;
  ProfitMarginPercent: number | string;
}

export interface MonthlySalesData {
  Year: number;
  Month: number;
  MonthName?: string;
  TotalRevenue: number | string;
  TotalProfit: number | string;
  TotalOrders: number | string;
}

export interface ProductAnalyticsData {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category: string;
  Subcategory: string;
  Brand: string;
  UnitsSold: number | string;
  TotalRevenue: number | string;
  TotalCost: number | string;
  TotalProfit: number | string;
  ProfitMarginPercent: number | string;
  TotalOrders: number | string;
  AverageSellingPrice: number | string;
  UnitsReturned: number | string;
  TotalRefundAmount: number | string;
  ReturnRatePercent: number | string;
}

export interface CustomerAnalyticsData {
  CustomerKey: number;
  CustomerID: string;
  FirstName: string;
  LastName: string;
  Gender?: string;
  Age?: number | string;
  CustomerSegment?: string;
  AcquisitionChannel?: string;
  City?: string;
  Country: string;
  TotalOrders: number | string;
  TotalRevenue: number | string;
  TotalProfit: number | string;
  ProfitMarginPercent?: number | string;
  AverageOrderValue: number | string;
  CustomerStatus?: string;
}

export interface MarketingAnalyticsData {
  ChannelName: string;
  AttributedRevenue: number | string;
  Spend: number | string;
  ROAS: number | string;
}

export interface ReturnsAnalyticsData {
  ReturnReason?: string;
  TotalReturns: number | string;
  TotalRefundAmount: number | string;
  ReturnRatePercent: number | string;
}

export interface SupportAnalyticsData {
  IssueType?: string;
  TotalTickets: number | string;
  ResolvedTickets?: number | string;
  AverageResolutionTime?: number | string;
}

export const analyticsService = {
  async getKPIs(): Promise<KPIData> {
    const response = await api.get("/analytics/kpis");

    return response.data.data;
  },

  async getMonthlySales(): Promise<MonthlySalesData[]> {
    const response = await api.get(
      "/analytics/monthly-sales"
    );

    return response.data.data ?? [];
  },

  async getTopProducts(): Promise<ProductAnalyticsData[]> {
    const response = await api.get(
      "/analytics/top-products"
    );

    return response.data.data ?? [];
  },

  async getCustomers(): Promise<CustomerAnalyticsData[]> {
    const response = await api.get(
      "/analytics/customers"
    );

    return response.data.data ?? [];
  },

  async getMarketing(): Promise<MarketingAnalyticsData[]> {
    const response = await api.get(
      "/analytics/marketing"
    );

    return response.data.data ?? [];
  },

  async getReturns(): Promise<ReturnsAnalyticsData[]> {
    const response = await api.get(
      "/analytics/returns"
    );

    return response.data.data ?? [];
  },

  async getSupport(): Promise<SupportAnalyticsData[]> {
    const response = await api.get(
      "/analytics/support"
    );

    return response.data.data ?? [];
  },
};

export default analyticsService;