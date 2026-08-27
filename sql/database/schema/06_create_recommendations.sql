USE shopsphere360;

CREATE TABLE IF NOT EXISTS recommendations (
    RecommendationKey BIGINT AUTO_INCREMENT PRIMARY KEY,
    InsightId VARCHAR(100) NOT NULL,
    Category VARCHAR(50) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Finding TEXT NOT NULL,
    Implication TEXT NOT NULL,
    RecommendationText TEXT NOT NULL,
    Priority ENUM('Low', 'Medium', 'High') NOT NULL,
    Status ENUM('New', 'InProgress', 'Done', 'Dismissed') NOT NULL DEFAULT 'New',
    AssignedToUserKey INT NULL,
    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ResolvedAt TIMESTAMP NULL,
    CONSTRAINT fk_recommendations_assignee
        FOREIGN KEY (AssignedToUserKey) REFERENCES users(UserKey),
    INDEX idx_recommendations_insight_status (InsightId, Status),
    INDEX idx_recommendations_status (Status),
    INDEX idx_recommendations_category (Category),
    INDEX idx_recommendations_priority (Priority)
);
