-- Fix: Ensure regional_costs table exists with proper RLS
-- This table is needed for AI analysis in Prioritize page

-- Create table if not exists
CREATE TABLE IF NOT EXISTS regional_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zip_code TEXT,
  city TEXT,
  state TEXT NOT NULL,
  region TEXT,
  avg_labor_rate_general DECIMAL(8,2),
  avg_labor_rate_hvac DECIMAL(8,2),
  avg_labor_rate_plumbing DECIMAL(8,2),
  avg_labor_rate_electrical DECIMAL(8,2),
  avg_labor_rate_roofing DECIMAL(8,2),
  avg_hvac_replacement DECIMAL(10,2),
  avg_water_heater_replacement DECIMAL(10,2),
  avg_roof_replacement_per_sqft DECIMAL(6,2),
  avg_roof_replacement_total DECIMAL(10,2),
  avg_window_replacement_per_unit DECIMAL(8,2),
  avg_siding_replacement_per_sqft DECIMAL(6,2),
  avg_flooring_replacement_per_sqft DECIMAL(6,2),
  cost_of_living_index DECIMAL(5,2) DEFAULT 100,
  construction_cost_index DECIMAL(5,2) DEFAULT 100,
  labor_cost_index DECIMAL(5,2) DEFAULT 100,
  materials_cost_index DECIMAL(5,2) DEFAULT 100,
  median_home_price DECIMAL(12,2),
  avg_property_tax_rate DECIMAL(5,4),
  data_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_regional_costs_zip ON regional_costs(zip_code);
CREATE INDEX IF NOT EXISTS idx_regional_costs_state ON regional_costs(state);
CREATE INDEX IF NOT EXISTS idx_regional_costs_city_state ON regional_costs(city, state);

-- Enable RLS
ALTER TABLE regional_costs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Anyone can view regional costs" ON regional_costs;

-- Create public read policy - this is reference data, not user-specific
CREATE POLICY "Anyone can view regional costs" ON regional_costs
  FOR SELECT USING (true);

-- Seed with sample data for common areas
INSERT INTO regional_costs (state, region, zip_code, city, cost_of_living_index, construction_cost_index, avg_labor_rate_general, avg_hvac_replacement, avg_roof_replacement_per_sqft, median_home_price)
VALUES
  ('WA', 'West Coast', '98662', 'Vancouver', 115, 110, 70, 8500, 6.50, 450000),
  ('WA', 'West Coast', '98101', 'Seattle', 155, 145, 95, 11000, 8.50, 900000),
  ('WA', 'West Coast', NULL, NULL, 120, 115, 75, 9000, 7.00, 500000),
  ('CA', 'West Coast', '90802', 'Long Beach', 145, 135, 85, 9500, 7.50, 750000),
  ('CA', 'West Coast', '90001', 'Los Angeles', 150, 140, 90, 10000, 8.00, 850000),
  ('TX', 'South', '77001', 'Houston', 95, 90, 55, 6500, 5.50, 350000),
  ('TX', 'South', '75201', 'Dallas', 100, 95, 60, 7000, 5.75, 400000),
  ('NY', 'Northeast', '10001', 'New York', 180, 170, 120, 15000, 12.00, 1200000),
  ('FL', 'South', '33101', 'Miami', 120, 115, 70, 8000, 6.50, 550000),
  ('IL', 'Midwest', '60601', 'Chicago', 105, 100, 65, 7500, 6.00, 380000)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE regional_costs IS 'Regional cost data for labor, materials, and replacements by location';
