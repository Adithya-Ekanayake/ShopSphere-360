import api from "./api";
import type { DashboardFilters } from "../types/filters";

export const serializeFilters = (filters?: Partial<DashboardFilters>): string => {
  const params = new URLSearchParams();

  Object.entries(filters ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

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
  FullName?: string;
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
  QuantityReturned: number | string;
  RefundAmount: number | string;
  ReturnReason?: string;
  TotalReturns: number | string;
  TotalRefundAmount: number | string;
  ReturnRatePercent: number | string;
}

export interface SupportAnalyticsData {
  IssueType?: string;
  Status?: string;
  TotalTickets: number | string;
  ResolvedTickets?: number | string;
  AverageResolutionTime?: number | string;
}

export const analyticsService = {
  async getKPIs(filters?: Partial<DashboardFilters>): Promise<KPIData> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/kpis?${params}`);

    return response.data.data;
  },

  async getMonthlySales(filters?: Partial<DashboardFilters>): Promise<MonthlySalesData[]> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/monthly-sales?${params}`);

    return response.data.data ?? [];
  },

  async getTopProducts(filters?: Partial<DashboardFilters>): Promise<ProductAnalyticsData[]> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/top-products?${params}`);

    return response.data.data ?? [];
  },

  async getCustomers(filters?: Partial<DashboardFilters>): Promise<CustomerAnalyticsData[]> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/customers?${params}`);

    return response.data.data ?? [];
  },

  async getMarketing(filters?: Partial<DashboardFilters>): Promise<MarketingAnalyticsData[]> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/marketing?${params}`);

    return response.data.data ?? [];
  },

  async getReturns(filters?: Partial<DashboardFilters>): Promise<ReturnsAnalyticsData[]> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/returns?${params}`);

    return response.data.data ?? [];
  },

  async getSupport(filters?: Partial<DashboardFilters>): Promise<SupportAnalyticsData[]> {
    const params = serializeFilters(filters);
    const response = await api.get(`/analytics/support?${params}`);

    return response.data.data ?? [];
  },

  async getFilterOptions() {
    const response = await api.get("/analytics/filter-options");
    return response.data.data;
  },
};

export default analyticsService;