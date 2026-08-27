import api from "./api";
import type { Customer, CustomerInput } from "../types/customer";

export interface CustomerListResult {
  data: Customer[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get("/customers");

    return response.data.data ?? [];
  },

  async getPage(page: number, search = ""): Promise<CustomerListResult> {
    const response = await api.get("/customers", { params: { page, limit: 25, search } });
    return {
      data: response.data.data ?? [],
      pagination: response.data.pagination ?? { page, limit: 25, total: 0, totalPages: 0 },
    };
  },

  async getOne(customerKey: number): Promise<Customer> {
    const response = await api.get(`/customers/${customerKey}`);

    return response.data.data;
  },

  async create(customer: CustomerInput): Promise<void> {
    await api.post("/customers", customer);
  },

  async update(
    customerKey: number,
    customer: Omit<CustomerInput, "CustomerID">
  ): Promise<void> {
    await api.put(`/customers/${customerKey}`, customer);
  },

  async remove(customerKey: number): Promise<void> {
    await api.delete(`/customers/${customerKey}`);
  },
};

export default customerService;