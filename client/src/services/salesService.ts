import api from "./api";

import type {
  SalesKPI,
  MonthlySales,
  ChannelSales,
  RecentOrder,
} from "../types/sales";

const salesService = {
  async getKPIs(): Promise<SalesKPI> {
    const response = await api.get("/sales/kpis");

    return response.data.data;
  },

  async getMonthlySales(): Promise<MonthlySales[]> {
    const response = await api.get("/sales/monthly");

    return response.data.data ?? [];
  },

  async getChannelSales(): Promise<ChannelSales[]> {
    const response = await api.get("/sales/channels");

    return response.data.data ?? [];
  },

  async getRecentOrders(): Promise<RecentOrder[]> {
    const response = await api.get("/sales/recent-orders");

    return response.data.data ?? [];
  },
};

export default salesService;