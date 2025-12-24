-- Migration 043: Add photo_urls column to maintenance_tasks
-- This column stores photos attached to maintenance tasks

ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]';

COMMENT ON COLUMN maintenance_tasks.photo_urls IS 'JSON array of photo URLs attached to this task';
