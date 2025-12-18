-- Migration 031: Add cascade risk columns to maintenance_tasks
-- These columns support the cascade risk calculation feature

-- Add cascade risk columns to maintenance_tasks
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS cascade_risk_score INTEGER CHECK (cascade_risk_score >= 0 AND cascade_risk_score <= 10),
ADD COLUMN IF NOT EXISTS cascade_risk_reason TEXT,
ADD COLUMN IF NOT EXISTS has_cascade_alert BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delayed_fix_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cost_impact_reason TEXT,
ADD COLUMN IF NOT EXISTS diy_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS urgency_timeline TEXT;

-- Create index for filtering by cascade risk
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_cascade_risk
ON maintenance_tasks(cascade_risk_score)
WHERE cascade_risk_score IS NOT NULL;

-- Create index for high-risk tasks (cascade_risk_score >= 7)
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_high_cascade_risk
ON maintenance_tasks(cascade_risk_score)
WHERE cascade_risk_score >= 7;

-- Add comment explaining the columns
COMMENT ON COLUMN maintenance_tasks.cascade_risk_score IS 'Risk score 1-10 indicating likelihood of cascading failures if issue is not addressed';
COMMENT ON COLUMN maintenance_tasks.cascade_risk_reason IS 'Explanation of what other systems/problems could result from delaying this repair';
COMMENT ON COLUMN maintenance_tasks.has_cascade_alert IS 'True when cascade_risk_score >= 7, triggers alert UI';
COMMENT ON COLUMN maintenance_tasks.delayed_fix_cost IS 'Estimated cost if repair is delayed and problem worsens';
COMMENT ON COLUMN maintenance_tasks.cost_impact_reason IS 'Explanation of cost impact if delayed';
COMMENT ON COLUMN maintenance_tasks.diy_cost IS 'Estimated cost for DIY repair';
COMMENT ON COLUMN maintenance_tasks.urgency_timeline IS 'How soon the task should be addressed';

-- Function to calculate cascade risk score based on system type and priority
CREATE OR REPLACE FUNCTION calculate_cascade_risk(
  p_system_type TEXT,
  p_priority TEXT DEFAULT 'Medium'
) RETURNS INTEGER AS $$
DECLARE
  base_risk INTEGER;
  priority_mult DECIMAL;
  final_score INTEGER;
BEGIN
  -- Base risk by system type
  base_risk := CASE p_system_type
    WHEN 'Foundation & Structure' THEN 9
    WHEN 'Roof System' THEN 8
    WHEN 'Plumbing System' THEN 7
    WHEN 'Water & Sewer/Septic' THEN 7
    WHEN 'Electrical System' THEN 6
    WHEN 'HVAC System' THEN 5
    WHEN 'Appliances' THEN 3
    WHEN 'Interior' THEN 2
    WHEN 'Exterior' THEN 4
    ELSE 5
  END;

  -- Priority multiplier
  priority_mult := CASE p_priority
    WHEN 'High' THEN 1.5
    WHEN 'Emergency' THEN 2.0
    WHEN 'Medium' THEN 1.0
    WHEN 'Low' THEN 0.5
    WHEN 'Routine' THEN 0.3
    ELSE 1.0
  END;

  -- Calculate final score (capped at 10)
  final_score := LEAST(10, ROUND(base_risk * priority_mult));

  RETURN final_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing tasks to calculate cascade risk score where missing
UPDATE maintenance_tasks
SET
  cascade_risk_score = calculate_cascade_risk(system_type, priority),
  has_cascade_alert = (calculate_cascade_risk(system_type, priority) >= 7)
WHERE cascade_risk_score IS NULL
  AND system_type IS NOT NULL;
