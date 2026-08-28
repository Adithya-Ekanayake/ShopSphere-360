export interface OrderKPI {
  TotalOrders: number;
  CompletedOrders: number;
  PendingOrders: number;
  CancelledOrders: number;
}

export interface Order {
  OrderKey: number;
  OrderID: string;

  CustomerName: string;
  CustomerID: string;
  CustomerCity?: string | null;
  CustomerCountry?: string | null;

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

export interface OrderItem {
  OrderItemKey: number;

  ProductKey: number;
  ProductID: string;
  ProductName: string;

  Quantity: number;

  UnitPrice: number | string;
  DiscountAmount: number | string;
  SalesAmount: number | string;
  CostAmount: number | string;
  ProfitAmount: number | string;
}

export interface Payment {
  PaymentKey: number;

  PaymentMethod: string;
  PaymentAmount: number | string;
  PaymentStatus: string;
  TransactionFee: number | string;
}

export interface OrderDetails extends Order {
  Gender?: string;
  Age?: number;
  CustomerCity?: string;
  CustomerCountry?: string;

  ChannelType?: string;
  Platform?: string;

  items: OrderItem[];
  payments: Payment[];
}