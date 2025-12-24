-- Add inspection_date, season, year columns to inspections table
-- Required for Track page to display inspections in timeline

ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS inspection_date TIMESTAMPTZ;

ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS season TEXT;

ALTER TABLE inspections
ADD COLUMN IF NOT EXISTS year INTEGER;

-- Add comments
COMMENT ON COLUMN inspections.inspection_date IS 'Date the inspection was completed - used by Track page timeline';
COMMENT ON COLUMN inspections.season IS 'Season of the inspection (Winter, Spring, Summer, Fall)';
COMMENT ON COLUMN inspections.year IS 'Year of the inspection';
