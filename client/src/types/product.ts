export interface Product {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category: string;
  Subcategory?: string | null;
  Brand?: string | null;
  Supplier?: string | null;
  UnitCost: number | string;
  UnitPrice: number | string;
  UnitsSold?: number | string;
  TotalRevenue?: number | string;
  TotalProfit?: number | string;
  MarginPercent?: number | string;
}

export interface ProductInput {
  ProductID: string;
  ProductName: string;
  Category: string;
  Subcategory?: string;
  Brand?: string;
  Supplier?: string;
  UnitCost: number | string;
  UnitPrice: number | string;
}