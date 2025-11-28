-- ============================================
-- 360° Method App - Data Architecture Restructure
-- Implements standardized address system and reference data tables
-- ============================================

-- ============================================
-- 1. ADDRESS STANDARDIZATION FUNCTION
-- Converts any address to a standardized unique key
-- Example: "1112 Orizaba Ave, Long Beach, CA 90804" -> "1112orizabaavelbca90804"
-- ============================================

CREATE OR REPLACE FUNCTION standardize_address(
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT
) RETURNS TEXT AS $$
DECLARE
  standardized TEXT;
BEGIN
  -- Combine address components
  standardized := COALESCE(street_address, '') ||
                  COALESCE(city, '') ||
                  COALESCE(state, '') ||
                  COALESCE(zip_code, '');

  -- Convert to lowercase
  standardized := LOWER(standardized);

  -- Remove all non-alphanumeric characters (spaces, punctuation, etc.)
  standardized := REGEXP_REPLACE(standardized, '[^a-z0-9]', '', 'g');

  -- Common abbreviations: normalize city names
  -- Long Beach -> lb, Los Angeles -> la, San Francisco -> sf, etc.
  standardized := REGEXP_REPLACE(standardized, 'longbeach', 'lb', 'g');
  standardized := REGEXP_REPLACE(standardized, 'losangeles', 'la', 'g');
  standardized := REGEXP_REPLACE(standardized, 'sanfrancisco', 'sf', 'g');
  standardized := REGEXP_REPLACE(standardized, 'sandiego', 'sd', 'g');
  standardized := REGEXP_REPLACE(standardized, 'newyork', 'ny', 'g');

  -- Common street abbreviations: normalize street types
  standardized := REGEXP_REPLACE(standardized, 'avenue', 'ave', 'g');
  standardized := REGEXP_REPLACE(standardized, 'street', 'st', 'g');
  standardized := REGEXP_REPLACE(standardized, 'boulevard', 'blvd', 'g');
  standardized := REGEXP_REPLACE(standardized, 'drive', 'dr', 'g');
  standardized := REGEXP_REPLACE(standardized, 'road', 'rd', 'g');
  standardized := REGEXP_REPLACE(standardized, 'lane', 'ln', 'g');
  standardized := REGEXP_REPLACE(standardized, 'court', 'ct', 'g');
  standardized := REGEXP_REPLACE(standardized, 'place', 'pl', 'g');
  standardized := REGEXP_REPLACE(standardized, 'circle', 'cir', 'g');

  RETURN standardized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION standardize_address IS 'Converts an address to a standardized unique key for deduplication and linking';

-- ============================================
-- 2. PUBLIC PROPERTY DATA TABLE
-- Stores data from external APIs (Zillow, county records, etc.)
-- This is NOT user-input data - it's from authoritative sources
-- ============================================

CREATE TABLE IF NOT EXISTS public_property_data (
  -- Primary key is the standardized address ID
  standardized_address_id TEXT PRIMARY KEY,

  -- Formatted address for display
  formatted_address TEXT,
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,

  -- Property characteristics from public records
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  square_footage INTEGER,
  lot_size_sqft INTEGER,
  lot_size_acres DECIMAL(10,4),
  year_built INTEGER,
  property_type TEXT, -- 'single_family', 'condo', 'townhouse', 'multi_family', etc.
  stories INTEGER,
  garage_spaces INTEGER,
  pool BOOLEAN DEFAULT false,

  -- Valuation data
  zestimate DECIMAL(12,2),
  zestimate_low DECIMAL(12,2),
  zestimate_high DECIMAL(12,2),
  rent_zestimate DECIMAL(10,2),
  tax_assessment DECIMAL(12,2),
  tax_year INTEGER,

  -- Sale history
  last_sale_price DECIMAL(12,2),
  last_sale_date DATE,

  -- Data source tracking
  data_source TEXT, -- 'zillow', 'county_records', 'realtor', 'redfin', etc.
  zillow_id TEXT,
  parcel_number TEXT,

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common lookups
CREATE INDEX idx_public_property_data_zip ON public_property_data(zip_code);
CREATE INDEX idx_public_property_data_city_state ON public_property_data(city, state);
CREATE INDEX idx_public_property_data_last_updated ON public_property_data(last_updated);

COMMENT ON TABLE public_property_data IS 'Property data from external APIs and public records. NOT user input.';

-- ============================================
-- 3. REGIONAL COSTS TABLE
-- Reference data for regional cost variations
-- ============================================

CREATE TABLE IF NOT EXISTS regional_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Location identifiers (can query by zip, city, or state)
  zip_code TEXT,
  city TEXT,
  state TEXT NOT NULL,
  region TEXT, -- 'West Coast', 'Northeast', 'Midwest', 'South', 'Southwest'

  -- Labor rates
  avg_labor_rate_general DECIMAL(8,2), -- General contractor hourly rate
  avg_labor_rate_hvac DECIMAL(8,2),
  avg_labor_rate_plumbing DECIMAL(8,2),
  avg_labor_rate_electrical DECIMAL(8,2),
  avg_labor_rate_roofing DECIMAL(8,2),

  -- Common replacement costs
  avg_hvac_replacement DECIMAL(10,2),
  avg_water_heater_replacement DECIMAL(10,2),
  avg_roof_replacement_per_sqft DECIMAL(6,2),
  avg_roof_replacement_total DECIMAL(10,2), -- Based on avg home size
  avg_appliance_replacement DECIMAL(10,2),
  avg_window_replacement_per_unit DECIMAL(8,2),
  avg_siding_replacement_per_sqft DECIMAL(6,2),
  avg_flooring_replacement_per_sqft DECIMAL(6,2),

  -- Cost indices (national average = 100)
  cost_of_living_index DECIMAL(5,2) DEFAULT 100,
  construction_cost_index DECIMAL(5,2) DEFAULT 100,
  labor_cost_index DECIMAL(5,2) DEFAULT 100,
  materials_cost_index DECIMAL(5,2) DEFAULT 100,

  -- Market data
  median_home_price DECIMAL(12,2),
  avg_property_tax_rate DECIMAL(5,4), -- As decimal (e.g., 0.0125 = 1.25%)

  -- Metadata
  data_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_regional_costs_zip ON regional_costs(zip_code);
CREATE INDEX idx_regional_costs_state ON regional_costs(state);
CREATE INDEX idx_regional_costs_city_state ON regional_costs(city, state);
CREATE UNIQUE INDEX idx_regional_costs_zip_unique ON regional_costs(zip_code) WHERE zip_code IS NOT NULL;

COMMENT ON TABLE regional_costs IS 'Regional cost data for labor, materials, and replacements by location';

-- ============================================
-- 4. SYSTEM LIFESPANS TABLE
-- Reference data for typical system lifespans
-- ============================================

CREATE TABLE IF NOT EXISTS system_lifespans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- System identification
  system_type TEXT NOT NULL UNIQUE, -- Matches system_baselines.system_type
  system_category TEXT, -- 'HVAC', 'Plumbing', 'Electrical', 'Structural', 'Appliances', etc.

  -- Lifespan data (in years)
  avg_lifespan_years INTEGER NOT NULL,
  min_lifespan_years INTEGER,
  max_lifespan_years INTEGER,

  -- Lifespan factors
  climate_impact TEXT, -- 'high', 'medium', 'low' - how much climate affects lifespan
  usage_impact TEXT, -- 'high', 'medium', 'low' - how much usage affects lifespan
  maintenance_impact TEXT, -- 'high', 'medium', 'low' - how much maintenance extends life

  -- Cost data (national averages)
  avg_replacement_cost_low DECIMAL(10,2),
  avg_replacement_cost_mid DECIMAL(10,2),
  avg_replacement_cost_high DECIMAL(10,2),

  -- Maintenance recommendations
  recommended_maintenance_frequency TEXT, -- 'monthly', 'quarterly', 'semi-annually', 'annually'
  maintenance_can_extend_life_years INTEGER, -- How many years good maintenance can add

  -- Warning signs
  typical_warning_signs JSONB DEFAULT '[]', -- Array of warning sign descriptions

  -- Metadata
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE system_lifespans IS 'Reference data for typical home system lifespans and replacement costs';

-- ============================================
-- 5. CONTRACTOR PRICING TABLE
-- Regional contractor pricing by service type
-- ============================================

CREATE TABLE IF NOT EXISTS contractor_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Location
  zip_code TEXT,
  city TEXT,
  state TEXT NOT NULL,

  -- Service identification
  service_type TEXT NOT NULL, -- 'hvac_repair', 'hvac_install', 'plumbing', 'electrical', etc.
  service_category TEXT, -- 'HVAC', 'Plumbing', 'Electrical', 'General', etc.

  -- Pricing data
  avg_cost_min DECIMAL(10,2), -- Low end of typical cost range
  avg_cost_max DECIMAL(10,2), -- High end of typical cost range
  avg_cost_mid DECIMAL(10,2), -- Median cost
  avg_hourly_rate DECIMAL(8,2),

  -- Service call fees
  avg_service_call_fee DECIMAL(8,2),
  avg_diagnostic_fee DECIMAL(8,2),

  -- Time estimates
  avg_duration_hours DECIMAL(5,2),

  -- Market data
  num_contractors_in_area INTEGER, -- For availability estimates
  avg_wait_time_days INTEGER, -- Typical scheduling lead time

  -- Metadata
  data_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW()),
  data_source TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_contractor_pricing_zip ON contractor_pricing(zip_code);
CREATE INDEX idx_contractor_pricing_state ON contractor_pricing(state);
CREATE INDEX idx_contractor_pricing_service ON contractor_pricing(service_type);
CREATE INDEX idx_contractor_pricing_zip_service ON contractor_pricing(zip_code, service_type);

COMMENT ON TABLE contractor_pricing IS 'Regional contractor pricing data by service type';

-- ============================================
-- 6. UPDATE PROPERTIES TABLE
-- Add standardized_address_id and foreign key relationships
-- ============================================

-- Add standardized_address_id column
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS standardized_address_id TEXT;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_properties_standardized_address
ON properties(standardized_address_id);

-- Add foreign key constraint (optional, as public_property_data may not have all addresses)
-- We don't enforce this as a strict FK since not all addresses will have public data
COMMENT ON COLUMN properties.standardized_address_id IS 'Links to public_property_data for external API data';

-- ============================================
-- 7. TRIGGER TO AUTO-GENERATE STANDARDIZED ADDRESS ID
-- Automatically sets standardized_address_id when address is saved
-- ============================================

CREATE OR REPLACE FUNCTION set_standardized_address_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate standardized_address_id from address components
  NEW.standardized_address_id := standardize_address(
    COALESCE(NEW.street_address, NEW.address),
    NEW.city,
    NEW.state,
    NEW.zip_code
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on properties table
DROP TRIGGER IF EXISTS properties_set_standardized_address ON properties;
CREATE TRIGGER properties_set_standardized_address
  BEFORE INSERT OR UPDATE OF address, street_address, city, state, zip_code
  ON properties
  FOR EACH ROW
  EXECUTE FUNCTION set_standardized_address_id();

-- ============================================
-- 8. BACKFILL EXISTING PROPERTIES
-- Generate standardized_address_id for existing records
-- ============================================

UPDATE properties
SET standardized_address_id = standardize_address(
  COALESCE(street_address, address),
  city,
  state,
  zip_code
)
WHERE standardized_address_id IS NULL;

-- ============================================
-- 9. ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================

-- Enable RLS
ALTER TABLE public_property_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_lifespans ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_pricing ENABLE ROW LEVEL SECURITY;

-- Public read access for reference tables (these are not user-specific)
CREATE POLICY "Anyone can view public property data" ON public_property_data
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view regional costs" ON regional_costs
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view system lifespans" ON system_lifespans
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view contractor pricing" ON contractor_pricing
  FOR SELECT USING (true);

-- Only service role can insert/update reference data
-- (handled via service role key, not RLS policies)

-- ============================================
-- 10. AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================

CREATE TRIGGER public_property_data_updated_at
  BEFORE UPDATE ON public_property_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER regional_costs_updated_at
  BEFORE UPDATE ON regional_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER system_lifespans_updated_at
  BEFORE UPDATE ON system_lifespans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER contractor_pricing_updated_at
  BEFORE UPDATE ON contractor_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 11. SEED DATA FOR SYSTEM LIFESPANS
-- Populate with common home systems
-- ============================================

INSERT INTO system_lifespans (system_type, system_category, avg_lifespan_years, min_lifespan_years, max_lifespan_years, climate_impact, usage_impact, maintenance_impact, avg_replacement_cost_low, avg_replacement_cost_mid, avg_replacement_cost_high, recommended_maintenance_frequency, maintenance_can_extend_life_years, typical_warning_signs)
VALUES
  ('HVAC', 'Heating & Cooling', 15, 10, 25, 'high', 'high', 'high', 5000, 8000, 15000, 'semi-annually', 5, '["Strange noises", "Uneven heating/cooling", "Rising energy bills", "Frequent repairs", "Age over 15 years"]'),
  ('Water Heater', 'Plumbing', 12, 8, 15, 'medium', 'high', 'medium', 800, 1500, 3000, 'annually', 3, '["Rusty water", "Popping sounds", "Leaks around base", "Inconsistent water temperature", "Age over 10 years"]'),
  ('Roof', 'Structural', 25, 15, 50, 'high', 'low', 'medium', 8000, 15000, 30000, 'annually', 10, '["Missing shingles", "Sagging areas", "Granules in gutters", "Visible wear", "Leaks or water stains"]'),
  ('Electrical Panel', 'Electrical', 40, 25, 60, 'low', 'medium', 'low', 1500, 2500, 4000, 'annually', 5, '["Flickering lights", "Tripped breakers", "Burning smell", "Warm panel", "Outdated fuse box"]'),
  ('Plumbing', 'Plumbing', 50, 25, 80, 'medium', 'high', 'medium', 2000, 5000, 15000, 'annually', 10, '["Low water pressure", "Slow drains", "Discolored water", "Visible corrosion", "Frequent leaks"]'),
  ('Garage Door', 'Exterior', 20, 15, 30, 'medium', 'high', 'medium', 800, 1200, 2500, 'annually', 5, '["Slow operation", "Strange noises", "Uneven movement", "Visible damage", "Spring problems"]'),
  ('Windows', 'Exterior', 25, 15, 40, 'high', 'low', 'low', 300, 600, 1500, 'annually', 5, '["Drafts", "Condensation between panes", "Difficult operation", "Visible decay", "Rising energy bills"]'),
  ('Siding', 'Exterior', 30, 20, 50, 'high', 'low', 'medium', 8000, 15000, 30000, 'annually', 10, '["Cracks", "Warping", "Fading", "Mold/mildew", "Loose panels"]'),
  ('Foundation', 'Structural', 100, 50, 150, 'medium', 'low', 'medium', 5000, 15000, 50000, 'annually', 20, '["Cracks in walls", "Uneven floors", "Doors not closing", "Water in basement", "Visible foundation cracks"]'),
  ('Dishwasher', 'Appliances', 10, 7, 15, 'low', 'high', 'medium', 400, 700, 1500, 'monthly', 2, '["Poor cleaning", "Strange odors", "Leaks", "Noisy operation", "Standing water"]'),
  ('Refrigerator', 'Appliances', 15, 10, 20, 'low', 'medium', 'medium', 800, 1500, 3000, 'quarterly', 3, '["Inconsistent temperature", "Excessive noise", "Frost buildup", "Leaks", "Running constantly"]'),
  ('Washer', 'Appliances', 12, 8, 15, 'low', 'high', 'medium', 500, 900, 1500, 'monthly', 3, '["Excessive vibration", "Leaks", "Not draining", "Strange odors", "Not spinning"]'),
  ('Dryer', 'Appliances', 13, 10, 18, 'low', 'high', 'medium', 400, 700, 1200, 'monthly', 3, '["Clothes not drying", "Excessive heat", "Strange noises", "Burning smell", "Long dry times"]'),
  ('Smoke Detectors', 'Safety', 10, 8, 10, 'low', 'low', 'low', 20, 50, 150, 'monthly', 0, '["Chirping", "Yellow color", "Age over 10 years", "Failed test", "Missing units"]'),
  ('Carbon Monoxide Detectors', 'Safety', 7, 5, 10, 'low', 'low', 'low', 30, 50, 100, 'monthly', 0, '["Chirping", "End of life indicator", "Age over 7 years", "Failed test"]'),
  ('Furnace', 'Heating & Cooling', 20, 15, 30, 'medium', 'high', 'high', 2500, 4500, 8000, 'annually', 5, '["Yellow pilot light", "Strange noises", "Uneven heating", "Frequent cycling", "Rising energy bills"]'),
  ('Air Conditioner', 'Heating & Cooling', 15, 10, 20, 'high', 'high', 'high', 3000, 5500, 10000, 'annually', 5, '["Poor cooling", "Strange noises", "Frequent cycling", "Ice on unit", "Refrigerant leaks"]'),
  ('Heat Pump', 'Heating & Cooling', 15, 10, 20, 'high', 'high', 'high', 4000, 7000, 12000, 'semi-annually', 5, '["Poor efficiency", "Strange noises", "Ice buildup", "Short cycling", "Rising energy bills"]'),
  ('Septic System', 'Plumbing', 30, 20, 40, 'medium', 'high', 'high', 3000, 8000, 25000, 'every 3 years', 10, '["Slow drains", "Odors", "Wet spots in yard", "Sewage backup", "Gurgling pipes"]'),
  ('Well Pump', 'Plumbing', 15, 8, 25, 'medium', 'high', 'medium', 1000, 2000, 4000, 'annually', 5, '["Low water pressure", "Cycling on/off", "Dirty water", "Air in pipes", "High electric bills"]')
ON CONFLICT (system_type) DO UPDATE SET
  avg_lifespan_years = EXCLUDED.avg_lifespan_years,
  min_lifespan_years = EXCLUDED.min_lifespan_years,
  max_lifespan_years = EXCLUDED.max_lifespan_years,
  avg_replacement_cost_low = EXCLUDED.avg_replacement_cost_low,
  avg_replacement_cost_mid = EXCLUDED.avg_replacement_cost_mid,
  avg_replacement_cost_high = EXCLUDED.avg_replacement_cost_high,
  typical_warning_signs = EXCLUDED.typical_warning_signs,
  last_updated = NOW();

-- ============================================
-- 12. SAMPLE REGIONAL COSTS DATA
-- Seed with some initial data (California examples)
-- ============================================

INSERT INTO regional_costs (state, region, zip_code, city, cost_of_living_index, construction_cost_index, avg_labor_rate_general, avg_hvac_replacement, avg_roof_replacement_per_sqft, median_home_price)
VALUES
  ('CA', 'West Coast', '90802', 'Long Beach', 145, 135, 85, 9500, 7.50, 750000),
  ('CA', 'West Coast', '90804', 'Long Beach', 142, 132, 82, 9200, 7.25, 680000),
  ('CA', 'West Coast', '90001', 'Los Angeles', 150, 140, 90, 10000, 8.00, 850000),
  ('CA', 'West Coast', '92101', 'San Diego', 148, 138, 88, 9800, 7.75, 820000),
  ('TX', 'South', '77001', 'Houston', 95, 90, 55, 6500, 5.50, 350000),
  ('TX', 'South', '75201', 'Dallas', 100, 95, 60, 7000, 5.75, 400000),
  ('NY', 'Northeast', '10001', 'New York', 180, 170, 120, 15000, 12.00, 1200000),
  ('FL', 'South', '33101', 'Miami', 120, 115, 70, 8000, 6.50, 550000),
  ('IL', 'Midwest', '60601', 'Chicago', 105, 100, 65, 7500, 6.00, 380000),
  ('WA', 'West Coast', '98101', 'Seattle', 155, 145, 95, 11000, 8.50, 900000)
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. HELPFUL VIEWS
-- ============================================

-- View to get property with public data joined
CREATE OR REPLACE VIEW property_with_public_data AS
SELECT
  p.*,
  ppd.zestimate,
  ppd.rent_zestimate,
  ppd.last_sale_price,
  ppd.last_sale_date,
  ppd.tax_assessment,
  ppd.data_source AS public_data_source,
  ppd.last_updated AS public_data_updated
FROM properties p
LEFT JOIN public_property_data ppd ON p.standardized_address_id = ppd.standardized_address_id;

-- View to get property with regional cost data
CREATE OR REPLACE VIEW property_with_regional_costs AS
SELECT
  p.*,
  rc.cost_of_living_index,
  rc.construction_cost_index,
  rc.avg_labor_rate_general,
  rc.avg_hvac_replacement,
  rc.avg_roof_replacement_per_sqft,
  rc.median_home_price
FROM properties p
LEFT JOIN regional_costs rc ON p.zip_code = rc.zip_code;

COMMENT ON VIEW property_with_public_data IS 'Properties joined with public API data';
COMMENT ON VIEW property_with_regional_costs IS 'Properties joined with regional cost data';
