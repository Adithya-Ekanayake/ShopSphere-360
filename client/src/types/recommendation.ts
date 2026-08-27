export type RecommendationPriority = "Low" | "Medium" | "High";
export type RecommendationStatus = "New" | "InProgress" | "Done" | "Dismissed";

export interface Recommendation {
  RecommendationKey: number;
  InsightId: string;
  Category: string;
  Title: string;
  Finding: string;
  Implication: string;
  RecommendationText: string;
  Priority: RecommendationPriority;
  Status: RecommendationStatus;
  AssignedToUserKey: number | null;
  AssignedToUsername?: string | null;
  AssignedToName?: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  ResolvedAt: string | null;
}

export interface RecommendationUpdate {
  status?: RecommendationStatus;
  assignedToUserKey?: number | null;
}
