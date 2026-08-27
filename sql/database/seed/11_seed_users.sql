-- ============================================================
-- ShopSphere 360 — Seed Initial Users
-- Passwords are bcrypt-hashed (10 rounds).
--   admin     password: Admin@123
--   manager   password: Manager@123
--   analyst   password: Analyst@123
-- ============================================================

USE shopsphere360;

INSERT INTO users (Username, Email, PasswordHash, Role, FullName) VALUES
  (
    'admin',
    'admin@shopsphere360.com',
    '$2b$10$JH7RLRd9cvzBH2gEU9XBZu8/lTFQsNdb7YDLjyxw9KCSpwm6yKfgy',
    'Admin',
    'System Administrator'
  ),
  (
    'manager',
    'manager@shopsphere360.com',
    '$2b$10$RLlJJzVa8m6ZOTc91MM7luZ6dlOJtMCxhpFA/n685C3d1kP2x6/86',
    'Manager',
    'Store Manager'
  ),
  (
    'analyst',
    'analyst@shopsphere360.com',
    '$2b$10$3pUUyUzqy4BscFiUR6k9uusDr6.VW4wB2off/pxUJx0jfDy8x/Qqq',
    'Analyst',
    'Business Analyst'
  );
