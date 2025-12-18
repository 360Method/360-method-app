-- Migration 036: Auto-create system baseline templates for new properties
-- Creates starter template systems when a property is created

-- Function to create baseline templates for a new property
CREATE OR REPLACE FUNCTION create_baseline_templates()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create templates for non-draft, setup-completed properties
  IF NEW.is_draft = false OR NEW.setup_completed = true THEN
    -- Insert template systems based on property type
    INSERT INTO system_baselines (
      property_id,
      system_type,
      category,
      name,
      condition,
      notes,
      created_at
    )
    SELECT
      NEW.id,
      system_type,
      category,
      name,
      'Unknown',
      'Not yet documented - add details during baseline inspection',
      NOW()
    FROM (VALUES
      -- Climate Control
      ('HVAC System', 'Climate Control', 'Central HVAC System'),
      ('Water Heater', 'Climate Control', 'Water Heater'),

      -- Structure
      ('Roof System', 'Structure', 'Roof'),
      ('Foundation', 'Structure', 'Foundation'),
      ('Siding/Exterior', 'Structure', 'Exterior Siding'),

      -- Plumbing
      ('Plumbing System', 'Plumbing', 'Main Plumbing'),
      ('Sump Pump', 'Plumbing', 'Sump Pump (if applicable)'),

      -- Electrical
      ('Electrical System', 'Electrical', 'Electrical Panel & Wiring'),

      -- Appliances
      ('Kitchen Appliances', 'Appliances', 'Major Kitchen Appliances'),
      ('Laundry', 'Appliances', 'Washer & Dryer'),

      -- Exterior
      ('Windows & Doors', 'Exterior', 'Windows and Entry Doors'),
      ('Garage', 'Exterior', 'Garage & Door')
    ) AS templates(system_type, category, name)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after property insert
DROP TRIGGER IF EXISTS trigger_create_baseline_templates ON properties;
CREATE TRIGGER trigger_create_baseline_templates
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION create_baseline_templates();

-- Also run for updates when property is completed from draft
DROP TRIGGER IF EXISTS trigger_create_baseline_templates_on_update ON properties;
CREATE TRIGGER trigger_create_baseline_templates_on_update
  AFTER UPDATE ON properties
  FOR EACH ROW
  WHEN (OLD.setup_completed = false AND NEW.setup_completed = true)
  EXECUTE FUNCTION create_baseline_templates();

-- Add comment
COMMENT ON FUNCTION create_baseline_templates() IS 'Auto-creates starter system baseline templates when a new property is created or completed';
