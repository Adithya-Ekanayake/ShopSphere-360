export interface SalesKPI {
  TotalOrders: number | string;
  TotalRevenue: number | string;
  TotalProfit: number | string;
  AverageOrderValue: number | string;
  ProfitMarginPercent: number | string;
}

export interface MonthlySales {
  Year: number;
  Month: number;
  MonthName: string;
  TotalOrders: number | string;
  TotalRevenue: number | string;
  TotalProfit: number | string;
}

export interface ChannelSales {
  ChannelName: string;
  TotalOrders: number | string;
  TotalRevenue: number | string;
}

export interface RecentOrder {
  OrderKey: number;
  OrderID: string;
  CustomerName: string;
  OrderDate: string;
  ChannelName: string;
  City: string;
  Region: string;
  Country: string;
  OrderStatus: string;
  PaymentStatus: string;
  ShippingStatus: string;
  OrderTotal: number | string;
  DiscountAmount: number | string;
  TaxAmount: number | string;
  ShippingAmount: number | string;
}