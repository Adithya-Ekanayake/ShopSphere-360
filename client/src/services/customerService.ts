import api from "./api";
import type { Customer, CustomerInput } from "../types/customer";

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get("/customers");

    return response.data.data ?? [];
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