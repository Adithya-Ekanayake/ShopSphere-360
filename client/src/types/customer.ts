export interface Customer {
  CustomerKey: number;
  CustomerID: string;
  FirstName: string;
  LastName: string;
  Gender?: string | null;
  Age?: number | null;
  SignupDate: string;
  CustomerSegment?: string | null;
  AcquisitionChannel?: string | null;
  City?: string | null;
  Country?: string | null;

  // Analytics fields returned by the backend
  TotalOrders?: number | string;
  TotalRevenue?: number | string;
  TotalProfit?: number | string;
  AverageOrderValue?: number | string;
}

export interface CustomerInput {
  CustomerID: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  Age: number | string;
  SignupDate: string;
  CustomerSegment: string;
  AcquisitionChannel: string;
  City: string;
  Country: string;
}