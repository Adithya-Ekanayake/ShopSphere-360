USE shopsphere360;

ALTER TABLE recommendations
    ADD COLUMN IF NOT EXISTS UpdatedByUserKey INT NULL AFTER UpdatedAt,
    ADD CONSTRAINT fk_recommendations_updated_by
        FOREIGN KEY (UpdatedByUserKey) REFERENCES users(UserKey),
    ADD INDEX idx_recommendations_status_updated (Status, UpdatedAt),
    ADD INDEX idx_recommendations_priority_updated (Priority, UpdatedAt);