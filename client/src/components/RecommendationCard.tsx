import { Lightbulb } from "lucide-react";
import type { Recommendation, RecommendationStatus } from "../types/recommendation";

const RecommendationCard = ({
  recommendation,
  canManage,
  onStatusChange,
  onAssigneeChange,
}: {
  recommendation: Recommendation;
  canManage: boolean;
  onStatusChange: (status: RecommendationStatus) => void;
  onAssigneeChange: (value: string) => void;
}) => (
  <article className={`recommendation-card priority-${recommendation.Priority.toLowerCase()}`}>
    <div className="recommendation-heading">
      <span className="recommendation-category">{recommendation.Category}</span>
      <span className={`recommendation-priority priority-text-${recommendation.Priority.toLowerCase()}`}>{recommendation.Priority}</span>
      <span className="recommendation-status">{recommendation.Status}</span>
    </div>
    <h3>{recommendation.Title}</h3>
    <p><strong>Finding:</strong> {recommendation.Finding}</p>
    <p><strong>Implication:</strong> {recommendation.Implication}</p>
    <div className="recommendation-action"><Lightbulb size={16} /><span><strong>Recommendation:</strong> {recommendation.RecommendationText}</span></div>
    {canManage ? <div className="recommendation-controls">
      <label>Status<select value={recommendation.Status} onChange={(event) => onStatusChange(event.target.value as RecommendationStatus)}><option value="New">New</option><option value="InProgress">In Progress</option><option value="Done">Done</option><option value="Dismissed">Dismissed</option></select></label>
      <label>Assignee<input type="number" min="1" placeholder="User key" value={recommendation.AssignedToUserKey ?? ""} onChange={(event) => onAssigneeChange(event.target.value)} /></label>
    </div> : null}
    <footer>Source: {recommendation.InsightId} · Updated {new Date(recommendation.UpdatedAt).toLocaleDateString()}</footer>
  </article>
);

export default RecommendationCard;
