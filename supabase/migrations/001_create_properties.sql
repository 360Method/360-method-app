-- ============================================
-- Properties Table
-- Core entity for the 360° Method App
-- ============================================

-- Create the properties table
CREATE TABLE IF NOT EXISTS properties (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Ownership (links to Supabase auth.users)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Address fields
  address TEXT NOT NULL,
  street_address TEXT,
  formatted_address TEXT,
  unit_number TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Property classification
  property_type TEXT, -- 'single_family', 'condo', 'townhouse', 'multi_family', etc.
  property_use_type TEXT, -- 'primary', 'rental', 'investment', 'vacation'

  -- Property details
  year_built INTEGER,
  square_footage INTEGER,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  lot_size DECIMAL(10,2),

  -- Financial info
  purchase_price DECIMAL(12,2),
  current_value DECIMAL(12,2),
  purchase_date DATE,

  -- Rental configuration (for investment properties)
  rental_config JSONB DEFAULT '{}',
  -- Structure: {
  --   rental_type: 'long_term' | 'short_term',
  --   number_of_rental_units: number,
  --   rental_square_footage: number,
  --   monthly_rent: number,
  --   nightly_rate: number,
  --   annual_turnovers: number,
  --   bookings_per_year: number
  -- }

  -- Multi-unit configuration
  units JSONB DEFAULT '[]',
  -- Structure: [{
  --   unit_name: string,
  --   square_footage: number,
  --   bedrooms: number,
  --   bathrooms: number,
  --   monthly_rent: number,
  --   is_occupied: boolean
  -- }]

  -- Wizard/draft state
  is_draft BOOLEAN DEFAULT false,
  draft_step INTEGER,
  setup_completed BOOLEAN DEFAULT false,

  -- 360° Method metrics
  baseline_completion INTEGER DEFAULT 0, -- 0-100 percentage
  health_score INTEGER DEFAULT 0, -- Overall property health score
  total_maintenance_spent DECIMAL(10,2) DEFAULT 0,
  estimated_disasters_prevented INTEGER DEFAULT 0,

  -- Photos
  photos JSONB DEFAULT '[]', -- Array of photo URLs

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for common queries
-- ============================================

-- User's properties (most common query)
CREATE INDEX idx_properties_user_id ON properties(user_id);

-- Filter by draft status
CREATE INDEX idx_properties_is_draft ON properties(is_draft);

-- Sort by created date
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Location-based queries
CREATE INDEX idx_properties_zip_code ON properties(zip_code);
CREATE INDEX idx_properties_state ON properties(state);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Users can only see their own properties
CREATE POLICY "Users can view own properties"
  ON properties
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own properties
CREATE POLICY "Users can create own properties"
  ON properties
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own properties
CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own properties
CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Auto-update timestamp trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE properties IS 'Core property records for the 360° Method App';
COMMENT ON COLUMN properties.baseline_completion IS 'Percentage (0-100) of baseline assessment completed';
COMMENT ON COLUMN properties.health_score IS 'Overall property health score based on system conditions';
COMMENT ON COLUMN properties.rental_config IS 'JSON configuration for rental properties (type, units, rates)';
COMMENT ON COLUMN properties.units IS 'JSON array of unit details for multi-family properties';
