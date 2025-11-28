-- ============================================
-- 011_service_packages.sql
-- Service packages and pricing templates for operators (Hybrid pricing model)
-- ============================================

-- Drop existing service_packages table if exists (recreating with proper schema)
DROP TABLE IF EXISTS service_packages CASCADE;

-- Service packages table (operator pricing templates)
CREATE TABLE service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,

  -- Package Info
  name TEXT NOT NULL,
  code TEXT, -- Short code like 'HVAC-STD', 'PLB-PRE'
  service_type TEXT NOT NULL, -- 'hvac', 'plumbing', 'electrical', 'roofing', 'general'
  package_tier TEXT NOT NULL CHECK (package_tier IN ('basic', 'standard', 'premium', 'diagnostic', 'emergency')),
  description TEXT,
  short_description TEXT, -- For display in lists

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'starting_at', 'hourly', 'per_unit')),
  hourly_rate DECIMAL(10,2), -- If price_type is 'hourly'
  minimum_hours DECIMAL(4,2),
  per_unit_price DECIMAL(10,2), -- If price_type is 'per_unit'
  unit_name TEXT, -- 'sq ft', 'linear ft', 'fixture', etc.

  -- Price Modifiers
  emergency_multiplier DECIMAL(4,2) DEFAULT 1.5, -- Multiply base price for emergency
  weekend_multiplier DECIMAL(4,2) DEFAULT 1.25,
  after_hours_multiplier DECIMAL(4,2) DEFAULT 1.25,

  -- What's Included
  includes JSONB DEFAULT '[]', -- ['Diagnostic', 'Parts up to $X', '90-day warranty', 'Cleanup']
  excludes JSONB DEFAULT '[]', -- ['Permits', 'Structural work', 'Code upgrades']

  -- Time Estimates
  estimated_duration TEXT, -- '1-2 hours', 'Half day'
  estimated_duration_min_hours DECIMAL(4,2),
  estimated_duration_max_hours DECIMAL(4,2),

  -- Warranty
  warranty_labor_days INTEGER DEFAULT 30,
  warranty_parts_days INTEGER DEFAULT 90,
  warranty_description TEXT,

  -- Availability
  active BOOLEAN DEFAULT true,
  available_online BOOLEAN DEFAULT true, -- Show on marketplace
  requires_inspection BOOLEAN DEFAULT false, -- Requires on-site visit before quote

  -- Upsells & Add-ons
  related_packages UUID[], -- Related package IDs for upsells
  add_ons JSONB DEFAULT '[]', -- [{name, price, description}]

  -- Display
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  icon TEXT, -- Lucide icon name
  color TEXT, -- Tailwind color class

  -- Stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service package categories (for grouping)
CREATE TABLE service_package_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link packages to categories
CREATE TABLE service_package_category_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_package_categories(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  UNIQUE(package_id, category_id)
);

-- Seasonal pricing adjustments
CREATE TABLE service_package_seasonal_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES service_packages(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Summer Peak', 'Winter Special'
  price_adjustment_type TEXT CHECK (price_adjustment_type IN ('fixed', 'percentage', 'multiplier')),
  price_adjustment_value DECIMAL(10,2), -- Amount, percent, or multiplier
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default packages (system templates operators can copy)
CREATE TABLE default_service_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  package_tier TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  includes JSONB DEFAULT '[]',
  excludes JSONB DEFAULT '[]',
  estimated_duration TEXT,
  warranty_labor_days INTEGER DEFAULT 30,
  warranty_parts_days INTEGER DEFAULT 90,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_service_packages_operator ON service_packages(operator_id);
CREATE INDEX IF NOT EXISTS idx_service_packages_service_type ON service_packages(service_type);
CREATE INDEX IF NOT EXISTS idx_service_packages_tier ON service_packages(package_tier);
CREATE INDEX IF NOT EXISTS idx_service_packages_active ON service_packages(active);

CREATE INDEX IF NOT EXISTS idx_service_package_categories_operator ON service_package_categories(operator_id);
CREATE INDEX IF NOT EXISTS idx_service_package_category_links_package ON service_package_category_links(package_id);

CREATE INDEX IF NOT EXISTS idx_service_package_seasonal_package ON service_package_seasonal_pricing(package_id);
CREATE INDEX IF NOT EXISTS idx_service_package_seasonal_dates ON service_package_seasonal_pricing(start_date, end_date);

-- Enable RLS
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_category_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_package_seasonal_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_service_packages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active packages"
  ON service_packages FOR SELECT
  USING (active = true AND available_online = true);

CREATE POLICY "Operators can manage own packages"
  ON service_packages FOR ALL
  USING (true);

CREATE POLICY "View package categories"
  ON service_package_categories FOR SELECT
  USING (true);

CREATE POLICY "Manage package categories"
  ON service_package_categories FOR ALL
  USING (true);

CREATE POLICY "View category links"
  ON service_package_category_links FOR SELECT
  USING (true);

CREATE POLICY "Manage category links"
  ON service_package_category_links FOR ALL
  USING (true);

CREATE POLICY "View seasonal pricing"
  ON service_package_seasonal_pricing FOR SELECT
  USING (true);

CREATE POLICY "Manage seasonal pricing"
  ON service_package_seasonal_pricing FOR ALL
  USING (true);

CREATE POLICY "View default packages"
  ON default_service_packages FOR SELECT
  USING (true);

-- Function to calculate package price with modifiers
CREATE OR REPLACE FUNCTION calculate_package_price(
  p_package_id UUID,
  p_date DATE DEFAULT CURRENT_DATE,
  p_is_emergency BOOLEAN DEFAULT false,
  p_is_weekend BOOLEAN DEFAULT false,
  p_is_after_hours BOOLEAN DEFAULT false
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_package RECORD;
  v_base_price DECIMAL(10,2);
  v_seasonal_adjustment DECIMAL(10,2) := 0;
  v_final_price DECIMAL(10,2);
BEGIN
  -- Get package
  SELECT * INTO v_package FROM service_packages WHERE id = p_package_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_base_price := v_package.base_price;

  -- Apply seasonal pricing
  SELECT
    CASE price_adjustment_type
      WHEN 'fixed' THEN price_adjustment_value
      WHEN 'percentage' THEN v_base_price * (price_adjustment_value / 100)
      WHEN 'multiplier' THEN v_base_price * (price_adjustment_value - 1)
      ELSE 0
    END
  INTO v_seasonal_adjustment
  FROM service_package_seasonal_pricing
  WHERE package_id = p_package_id
    AND active = true
    AND p_date BETWEEN start_date AND end_date
  LIMIT 1;

  v_final_price := v_base_price + COALESCE(v_seasonal_adjustment, 0);

  -- Apply multipliers
  IF p_is_emergency THEN
    v_final_price := v_final_price * COALESCE(v_package.emergency_multiplier, 1.5);
  END IF;

  IF p_is_weekend THEN
    v_final_price := v_final_price * COALESCE(v_package.weekend_multiplier, 1.25);
  END IF;

  IF p_is_after_hours THEN
    v_final_price := v_final_price * COALESCE(v_package.after_hours_multiplier, 1.25);
  END IF;

  RETURN ROUND(v_final_price, 2);
END;
$$;

-- Function to copy default packages to operator
CREATE OR REPLACE FUNCTION copy_default_packages_to_operator(p_operator_id UUID, p_service_types TEXT[] DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER := 0;
  v_package RECORD;
BEGIN
  FOR v_package IN
    SELECT * FROM default_service_packages
    WHERE active = true
    AND (p_service_types IS NULL OR service_type = ANY(p_service_types))
  LOOP
    INSERT INTO service_packages (
      operator_id,
      name,
      service_type,
      package_tier,
      description,
      base_price,
      includes,
      excludes,
      estimated_duration,
      warranty_labor_days,
      warranty_parts_days
    )
    VALUES (
      p_operator_id,
      v_package.name,
      v_package.service_type,
      v_package.package_tier,
      v_package.description,
      v_package.base_price,
      v_package.includes,
      v_package.excludes,
      v_package.estimated_duration,
      v_package.warranty_labor_days,
      v_package.warranty_parts_days
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Function to get operator packages with calculated prices
CREATE OR REPLACE FUNCTION get_operator_packages_with_pricing(
  p_operator_id UUID,
  p_service_type TEXT DEFAULT NULL,
  p_date DATE DEFAULT CURRENT_DATE,
  p_is_emergency BOOLEAN DEFAULT false
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  service_type TEXT,
  package_tier TEXT,
  description TEXT,
  base_price DECIMAL(10,2),
  calculated_price DECIMAL(10,2),
  includes JSONB,
  estimated_duration TEXT,
  featured BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.name,
    sp.service_type,
    sp.package_tier,
    sp.description,
    sp.base_price,
    calculate_package_price(sp.id, p_date, p_is_emergency, false, false) as calculated_price,
    sp.includes,
    sp.estimated_duration,
    sp.featured
  FROM service_packages sp
  WHERE sp.operator_id = p_operator_id
    AND sp.active = true
    AND (p_service_type IS NULL OR sp.service_type = p_service_type)
  ORDER BY sp.featured DESC, sp.display_order, sp.base_price;
END;
$$;

-- Insert default service packages
INSERT INTO default_service_packages (name, service_type, package_tier, description, base_price, includes, excludes, estimated_duration, warranty_labor_days, warranty_parts_days) VALUES
-- HVAC Packages
('HVAC Diagnostic', 'hvac', 'diagnostic', 'Complete diagnostic of your HVAC system to identify issues', 89.00,
 '["Full system inspection", "Thermostat check", "Filter inspection", "Refrigerant level check", "Detailed report"]'::JSONB,
 '["Repairs", "Parts replacement"]'::JSONB,
 '1 hour', 30, 0),

('HVAC Tune-Up', 'hvac', 'basic', 'Basic maintenance tune-up for optimal performance', 149.00,
 '["System diagnostic", "Filter replacement (standard)", "Coil cleaning", "Thermostat calibration", "Safety inspection"]'::JSONB,
 '["Refrigerant top-off", "Part repairs"]'::JSONB,
 '1-2 hours', 30, 90),

('HVAC Premium Service', 'hvac', 'premium', 'Comprehensive HVAC service and maintenance', 249.00,
 '["Complete diagnostic", "Filter replacement", "Coil deep cleaning", "Refrigerant top-off (up to 1lb)", "Duct inspection", "Thermostat optimization", "1-year parts warranty"]'::JSONB,
 '["Major repairs", "Duct cleaning"]'::JSONB,
 '2-3 hours', 90, 365),

-- Plumbing Packages
('Plumbing Diagnostic', 'plumbing', 'diagnostic', 'Professional assessment of plumbing issues', 79.00,
 '["Problem identification", "System inspection", "Written estimate"]'::JSONB,
 '["Repairs", "Parts"]'::JSONB,
 '30-60 min', 30, 0),

('Drain Cleaning - Basic', 'plumbing', 'basic', 'Clear single clogged drain', 129.00,
 '["Single drain clearing", "Camera inspection", "Maintenance tips"]'::JSONB,
 '["Multiple drains", "Main line issues"]'::JSONB,
 '1 hour', 30, 30),

('Drain Cleaning - Whole Home', 'plumbing', 'premium', 'Complete drain cleaning for entire home', 349.00,
 '["All drain clearing", "Main line cleaning", "Camera inspection", "Video report", "90-day guarantee"]'::JSONB,
 '["Pipe repairs", "Root removal"]'::JSONB,
 '2-4 hours', 90, 90),

-- Electrical Packages
('Electrical Diagnostic', 'electrical', 'diagnostic', 'Electrical system safety inspection', 99.00,
 '["Circuit testing", "Outlet inspection", "Panel inspection", "Safety report"]'::JSONB,
 '["Repairs", "Upgrades"]'::JSONB,
 '1 hour', 30, 0),

('Outlet/Switch Repair', 'electrical', 'basic', 'Repair or replace outlet or switch', 149.00,
 '["Single outlet/switch", "Standard parts", "Testing"]'::JSONB,
 '["Multiple outlets", "Wiring upgrades"]'::JSONB,
 '30-60 min', 30, 90),

-- General/Handyman
('Handyman Hour', 'general', 'basic', 'General repairs and small jobs', 85.00,
 '["1 hour of service", "Basic materials"]'::JSONB,
 '["Specialized work", "Major repairs"]'::JSONB,
 '1 hour', 30, 30),

('Home Inspection', 'general', 'standard', 'General home systems inspection', 199.00,
 '["Visual inspection of major systems", "Written report", "Priority recommendations"]'::JSONB,
 '["Specialized testing", "Repairs"]'::JSONB,
 '2-3 hours', 30, 0),

-- Emergency
('Emergency Service Call', 'general', 'emergency', 'After-hours emergency response', 199.00,
 '["Same-day response", "Diagnostic", "Temporary fix if needed"]'::JSONB,
 '["Major repairs", "Parts"]'::JSONB,
 '1-2 hours', 30, 30);
