-- ============================================
-- Add columns for inspection save/resume functionality
-- ============================================

-- Add current_area_index to track where user left off
ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS current_area_index INTEGER DEFAULT 0;

-- Add areas_completed to track which areas are done (array of area IDs)
ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS areas_completed JSONB DEFAULT '[]';

-- Add comment for documentation
COMMENT ON COLUMN inspections.current_area_index IS 'Index of the current area in the walkthrough (for resume functionality)';
COMMENT ON COLUMN inspections.areas_completed IS 'Array of area IDs that have been completed in this inspection';
