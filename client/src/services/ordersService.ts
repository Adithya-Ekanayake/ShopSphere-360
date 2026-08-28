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
    const limit = 100;
    const firstResponse = await api.get("/orders", {
      params: { page: 1, limit },
    });
    const firstPage = firstResponse.data?.data ?? [];
    const totalPages = firstResponse.data?.pagination?.totalPages ?? 1;

    if (totalPages <= 1) return firstPage;

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) =>
        api.get("/orders", {
          params: { page: index + 2, limit },
        })
      )
    );

    return [
      ...firstPage,
      ...remainingPages.flatMap((response) => response.data?.data ?? []),
    ];
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