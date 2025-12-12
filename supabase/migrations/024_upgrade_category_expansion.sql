-- Expand upgrade categories to support more project types
-- Original: 'Property Value', 'Energy Efficiency', 'Rental Appeal', 'Safety', 'Comfort'
-- New additions: 'High ROI Renovations', 'Rental Income Boosters', 'Preventive Replacements',
--                'Curb Appeal', 'Interior Updates', 'Quality of Life', 'Health & Safety'

-- Drop the existing constraint
ALTER TABLE upgrades DROP CONSTRAINT IF EXISTS upgrades_category_check;

-- Add the expanded constraint
ALTER TABLE upgrades ADD CONSTRAINT upgrades_category_check
  CHECK (category IN (
    'Property Value',
    'Energy Efficiency',
    'Rental Appeal',
    'Safety',
    'Comfort',
    'High ROI Renovations',
    'Rental Income Boosters',
    'Preventive Replacements',
    'Curb Appeal',
    'Interior Updates',
    'Quality of Life',
    'Health & Safety'
  ));

-- Also expand the status options to match the UI
ALTER TABLE upgrades DROP CONSTRAINT IF EXISTS upgrades_status_check;

ALTER TABLE upgrades ADD CONSTRAINT upgrades_status_check
  CHECK (status IN (
    'Identified',
    'Planned',
    'In Progress',
    'Completed',
    'Deferred',
    'Researching',
    'Wishlist'
  ));
