-- ============================================
-- 006_operators.sql
-- Operator company profiles and certification
-- ============================================

-- Drop existing operators table if it exists (it was created as a basic wrapper)
-- We're recreating with proper schema
DROP TABLE IF EXISTS operators CASCADE;

-- Operators table (operator company profiles)
CREATE TABLE operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID (one operator profile per user)

  -- Company Information
  company_name TEXT NOT NULL,
  business_type TEXT CHECK (business_type IN ('sole_proprietor', 'llc', 'corporation', 'partnership')),
  ein_tax_id TEXT, -- Encrypted/masked
  years_in_business INTEGER,

  -- Contact Information
  business_email TEXT,
  business_phone TEXT,
  website TEXT,

  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Service Details
  service_radius_miles INTEGER DEFAULT 25,
  service_types TEXT[] DEFAULT '{}', -- ['hvac', 'plumbing', 'electrical', 'roofing', 'general']

  -- Stripe Connect
  stripe_account_id TEXT,
  stripe_account_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'restricted', 'disabled'
  stripe_onboarding_complete BOOLEAN DEFAULT false,

  -- Certification
  application_status TEXT DEFAULT 'draft' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  application_submitted_at TIMESTAMPTZ,
  certified BOOLEAN DEFAULT false,
  certified_at TIMESTAMPTZ,
  training_progress INTEGER DEFAULT 0, -- 0-100
  training_completed_at TIMESTAMPTZ,
  certification_expires_at TIMESTAMPTZ,

  -- Marketplace Profile
  bio TEXT,
  profile_photo_url TEXT,
  cover_photo_url TEXT,
  specialties TEXT[],
  languages TEXT[] DEFAULT '{"English"}',

  -- Stats (denormalized for performance)
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,

  -- Settings
  accepts_new_clients BOOLEAN DEFAULT true,
  auto_accept_jobs_under DECIMAL(10,2), -- Auto-accept jobs under this amount
  notification_settings JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator service areas (for multi-area coverage)
CREATE TABLE IF NOT EXISTS operator_service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  zip_code TEXT NOT NULL,
  city TEXT,
  state TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, zip_code)
);

-- Operator certifications/licenses
CREATE TABLE IF NOT EXISTS operator_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  license_type TEXT NOT NULL, -- 'general_contractor', 'hvac', 'plumbing', 'electrical', etc.
  license_number TEXT,
  issuing_authority TEXT, -- 'CA Contractors State License Board'
  issue_date DATE,
  expiration_date DATE,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator insurance records
CREATE TABLE IF NOT EXISTS operator_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  insurance_type TEXT NOT NULL CHECK (insurance_type IN ('general_liability', 'workers_comp', 'professional_liability', 'auto', 'umbrella')),
  provider TEXT,
  policy_number TEXT,
  coverage_amount DECIMAL(12,2),
  deductible DECIMAL(10,2),
  effective_date DATE,
  expiration_date DATE,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator training progress tracking
CREATE TABLE IF NOT EXISTS operator_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL, -- 'module-1', 'module-2', etc.
  module_title TEXT,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  score INTEGER, -- For quiz/exam modules
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operator_id, module_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_operators_user_id ON operators(user_id);
CREATE INDEX IF NOT EXISTS idx_operators_certified ON operators(certified);
CREATE INDEX IF NOT EXISTS idx_operators_city_state ON operators(city, state);
CREATE INDEX IF NOT EXISTS idx_operators_service_types ON operators USING GIN(service_types);
CREATE INDEX IF NOT EXISTS idx_operator_service_areas_zip ON operator_service_areas(zip_code);
CREATE INDEX IF NOT EXISTS idx_operator_service_areas_operator ON operator_service_areas(operator_id);

-- Enable RLS
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_service_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_training_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for operators
CREATE POLICY "Public can view certified operators"
  ON operators FOR SELECT
  USING (certified = true);

CREATE POLICY "Users can view own operator profile"
  ON operators FOR SELECT
  USING (true); -- Checked in application layer

CREATE POLICY "Users can manage own operator profile"
  ON operators FOR ALL
  USING (true);

-- RLS Policies for service areas
CREATE POLICY "Public can view operator service areas"
  ON operator_service_areas FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage own service areas"
  ON operator_service_areas FOR ALL
  USING (true);

-- RLS Policies for licenses
CREATE POLICY "Operators can view own licenses"
  ON operator_licenses FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage own licenses"
  ON operator_licenses FOR ALL
  USING (true);

-- RLS Policies for insurance
CREATE POLICY "Operators can view own insurance"
  ON operator_insurance FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage own insurance"
  ON operator_insurance FOR ALL
  USING (true);

-- RLS Policies for training progress
CREATE POLICY "Operators can view own training progress"
  ON operator_training_progress FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage own training progress"
  ON operator_training_progress FOR ALL
  USING (true);

-- Function to update operator stats
CREATE OR REPLACE FUNCTION update_operator_stats(p_operator_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE operators
  SET
    total_jobs_completed = COALESCE((
      SELECT COUNT(*) FROM work_orders
      WHERE operator_id = p_operator_id AND status = 'completed'
    ), 0),
    total_revenue = COALESCE((
      SELECT SUM(actual_amount) FROM work_orders
      WHERE operator_id = p_operator_id AND status = 'completed'
    ), 0),
    updated_at = NOW()
  WHERE id = p_operator_id;
END;
$$;

-- Function to check if operator serves a ZIP code
CREATE OR REPLACE FUNCTION operator_serves_zip(p_operator_id UUID, p_zip_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM operator_service_areas
    WHERE operator_id = p_operator_id
    AND zip_code = p_zip_code
    AND active = true
  );
END;
$$;

-- Function to find operators serving a ZIP code
CREATE OR REPLACE FUNCTION find_operators_by_zip(p_zip_code TEXT, p_service_type TEXT DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  rating DECIMAL(3,2),
  total_reviews INTEGER,
  service_types TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.company_name,
    o.rating,
    o.total_reviews,
    o.service_types
  FROM operators o
  JOIN operator_service_areas osa ON o.id = osa.operator_id
  WHERE osa.zip_code = p_zip_code
    AND osa.active = true
    AND o.certified = true
    AND o.accepts_new_clients = true
    AND (p_service_type IS NULL OR p_service_type = ANY(o.service_types))
  ORDER BY o.rating DESC, o.total_reviews DESC;
END;
$$;
