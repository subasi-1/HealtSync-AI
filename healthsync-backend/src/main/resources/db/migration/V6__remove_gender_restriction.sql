-- Flyway Database Migration V6
-- Remove unused gender_restriction column from wards table to align with entity model

ALTER TABLE wards DROP COLUMN IF EXISTS gender_restriction;
