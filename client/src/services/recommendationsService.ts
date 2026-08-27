import api from "./api";
import type { DashboardFilters } from "../types/filters";
import type { Recommendation, RecommendationStatus, RecommendationPriority } from "../types/recommendation";
import { serializeFilters } from "./analyticsService";

export type RecommendationQuery = Omit<Partial<DashboardFilters>, "status"> & { status?: RecommendationStatus; category?: string; priority?: RecommendationPriority; page?: number; limit?: number; search?: string };

const getRecommendations = async (filters?: RecommendationQuery): Promise<{ data: Recommendation[]; totalPages: number }> => {
  const query = serializeFilters(filters);
  const response = await api.get(`/recommendations?${query}`);
  return { data: response.data?.data ?? [], totalPages: response.data?.pagination?.totalPages ?? 0 };
};

const syncRecommendations = async (filters?: Partial<DashboardFilters>) => {
  const query = serializeFilters(filters);
  const response = await api.post(`/recommendations/sync?${query}`);
  return response.data;
};

const updateRecommendation = async (key: number, update: { status?: RecommendationStatus; assignedToUserKey?: number | null }) => {
  const response = await api.patch(`/recommendations/${key}`, update);
  return response.data?.data as Recommendation;
};

export default { getRecommendations, syncRecommendations, updateRecommendation };
