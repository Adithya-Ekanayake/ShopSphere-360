export interface KPIData {
  TotalOrders: number;
  TotalCustomers: number;
  TotalRevenue: string;
  TotalProfit: string;
  ProfitMarginPercent: string;
  AverageOrderValue: string;
}

export interface KPIResponse {
  status: string;
  data: KPIData;
}
