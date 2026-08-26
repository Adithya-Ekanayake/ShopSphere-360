import api from "./api";

import type {
  Order,
  OrderKPI,
  OrderDetails,
} from "../types/orders";

const ordersService = {
  async getKPIs(): Promise<OrderKPI> {
    const response = await api.get("/orders/kpis");

    return response.data?.data ?? {
      TotalOrders: 0,
      CompletedOrders: 0,
      PendingOrders: 0,
      CancelledOrders: 0,
    };
  },

  async getOrders(): Promise<Order[]> {
    const response = await api.get("/orders");

    return response.data?.data ?? [];
  },

  async getOrderById(
    id: string | number
  ): Promise<OrderDetails> {
    const response = await api.get(
      `/orders/${id}`
    );

    return response.data.data;
  },
};

export default ordersService;