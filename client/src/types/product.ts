export interface Product {
  ProductKey: number;
  ProductID: string;
  ProductName: string;
  Category: string;
  Subcategory: string | null;
  Brand: string | null;
  Supplier: string | null;
  UnitCost: number;
  UnitPrice: number;
}

export interface ProductInput {
  ProductID: string;
  ProductName: string;
  Category: string;
  Subcategory?: string;
  Brand?: string;
  Supplier?: string;
  UnitCost: number;
  UnitPrice: number;
}