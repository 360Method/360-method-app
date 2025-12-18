-- ============================================
-- 029_canonical_properties.sql
-- Creates the canonical_properties table for address deduplication
-- Fixes missing FK reference from operator_leads.canonical_property_id
-- ============================================

-- ============================================
-- 1. CANONICAL PROPERTIES TABLE
-- Stores deduplicated property data from public sources
-- Used for address standardization and property enrichment
-- ============================================
CREATE TABLE IF NOT EXISTS canonical_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Standardized address (unique identifier)
  standardized_address_id TEXT UNIQUE NOT NULL,

  -- Address components (normalized)
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  county TEXT,

  -- Property characteristics (from public data)
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  sqft INTEGER,
  lot_size_sqft INTEGER,
  year_built INTEGER,
  stories INTEGER,

  -- Valuation data
  estimated_value DECIMAL(12,2),
  last_sale_date DATE,
  last_sale_price DECIMAL(12,2),
  tax_assessed_value DECIMAL(12,2),
  tax_year INTEGER,

  -- Location data
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),

  -- Data source tracking
  data_source TEXT DEFAULT 'manual',  -- 'zillow', 'attom', 'realtor', 'manual'
  data_fetched_at TIMESTAMPTZ,
  data_quality_score INTEGER DEFAULT 0,  -- 0-100 confidence score

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_canonical_properties_address ON canonical_properties(standardized_address_id);
CREATE INDEX IF NOT EXISTS idx_canonical_properties_zip ON canonical_properties(zip_code);
CREATE INDEX IF NOT EXISTS idx_canonical_properties_city_state ON canonical_properties(city, state);
CREATE INDEX IF NOT EXISTS idx_canonical_properties_location ON canonical_properties(latitude, longitude);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE canonical_properties ENABLE ROW LEVEL SECURITY;

-- Public read access (canonical data is shared)
CREATE POLICY "Anyone can read canonical_properties"
  ON canonical_properties FOR SELECT
  USING (true);

-- Service role only for writes
CREATE POLICY "Service role manages canonical_properties"
  ON canonical_properties FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to standardize an address into an ID
-- Removes spaces, special chars, converts to lowercase
-- Drop first to allow parameter rename
DROP FUNCTION IF EXISTS standardize_address(TEXT, TEXT, TEXT, TEXT);
CREATE FUNCTION standardize_address(
  p_street TEXT,
  p_city TEXT,
  p_state TEXT,
  p_zip TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_result TEXT;
BEGIN
  -- Concatenate and normalize
  v_result := LOWER(
    REGEXP_REPLACE(
      p_street || p_city || p_state || p_zip,
      '[^a-zA-Z0-9]',
      '',
      'g'
    )
  );
  RETURN v_result;
END;
$$;

-- Get or create canonical property
CREATE OR REPLACE FUNCTION get_or_create_canonical_property(
  p_street TEXT,
  p_city TEXT,
  p_state TEXT,
  p_zip TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_std_id TEXT;
  v_canonical_id UUID;
BEGIN
  -- Generate standardized ID
  v_std_id := standardize_address(p_street, p_city, p_state, p_zip);

  -- Try to find existing
  SELECT id INTO v_canonical_id
  FROM canonical_properties
  WHERE standardized_address_id = v_std_id;

  -- Create if not found
  IF v_canonical_id IS NULL THEN
    INSERT INTO canonical_properties (
      standardized_address_id,
      street_address,
      city,
      state,
      zip_code
    )
    VALUES (v_std_id, p_street, p_city, p_state, p_zip)
    RETURNING id INTO v_canonical_id;
  END IF;

  RETURN v_canonical_id;
END;
$$;

-- ============================================
-- 5. UPDATED_AT TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at_canonical_properties ON canonical_properties;
CREATE TRIGGER set_updated_at_canonical_properties
  BEFORE UPDATE ON canonical_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Done: canonical_properties table created
-- operator_leads.canonical_property_id FK now valid
-- ============================================
