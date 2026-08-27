import api from "./api";
import { serializeFilters } from "./analyticsService";
import type { DashboardFilters } from "../types/filters";
import type { Insight } from "../types/insight";

const getInsights = async (filters?: Partial<DashboardFilters>): Promise<Insight[]> => {
  const query = serializeFilters(filters);
  const response = await api.get(`/insights?${query}`);
  return response.data?.data ?? [];
};

export default { getInsights };
