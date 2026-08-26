export interface TransactionKPI {
  TotalTransactions: number;
  TotalPaymentAmount: number;
  TotalTransactionFees: number;
  AverageTransactionValue: number;
}

export interface Transaction {
  PaymentKey: number;
  OrderKey: number;
  OrderID: string;
  DateKey: number;
  TransactionDate: string;
  PaymentMethod: string;
  PaymentAmount: number | string;
  PaymentStatus: string;
  TransactionFee: number | string;
}

export interface TransactionByMethod {
  PaymentMethod: string;
  TotalTransactions: number | string;
  TotalAmount: number | string;
}