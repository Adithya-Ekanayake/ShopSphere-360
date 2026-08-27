-- ============================================================
-- ShopSphere 360
-- User Accounts Schema
-- ============================================================

USE shopsphere360;

CREATE TABLE IF NOT EXISTS users (
    UserKey INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Manager', 'Analyst') NOT NULL,
    FullName VARCHAR(100) NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
