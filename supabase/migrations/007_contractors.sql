-- ============================================
-- 007_contractors.sql
-- Contractors, invitations, and operator-contractor relationships
-- ============================================

-- Drop existing contractors table if it exists
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS contractor_jobs CASCADE;

-- Contractors table (individual workers)
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE, -- Clerk user ID (one contractor profile per user)
  operator_id UUID REFERENCES operators(id) ON DELETE SET NULL, -- Primary operator they work for

  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  profile_photo_url TEXT,

  -- Address (for routing/distance calculations)
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Trade Information
  trade_types TEXT[] DEFAULT '{}', -- ['hvac', 'plumbing', 'electrical', 'general']
  skills TEXT[], -- More specific: ['water heater', 'drain cleaning', 'faucet repair']
  certifications TEXT[], -- ['EPA 608', 'NATE', 'Master Plumber']
  years_experience INTEGER,

  -- Rates
  hourly_rate DECIMAL(10,2),
  emergency_rate DECIMAL(10,2), -- After hours/emergency rate
  travel_fee DECIMAL(10,2) DEFAULT 0,

  -- Availability
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
  available BOOLEAN DEFAULT true, -- Can receive new jobs
  max_jobs_per_day INTEGER DEFAULT 4,
  service_radius_miles INTEGER DEFAULT 15,

  -- Work preferences
  works_weekends BOOLEAN DEFAULT false,
  works_evenings BOOLEAN DEFAULT false,
  preferred_job_types TEXT[], -- ['residential', 'commercial']

  -- Stats (denormalized for performance)
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_jobs_completed INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  jobs_completed_this_month INTEGER DEFAULT 0,
  on_time_percentage DECIMAL(5,2) DEFAULT 100,

  -- Settings
  notification_settings JSONB DEFAULT '{}',

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractor invitations table
CREATE TABLE contractor_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,

  -- Invitation Details
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE, -- Unique invitation token
  trade_type TEXT,
  hourly_rate_offered DECIMAL(10,2),
  message TEXT, -- Personal message from operator

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked')),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES contractors(id),

  -- Tracking
  sent_count INTEGER DEFAULT 1, -- Times invitation was sent
  last_sent_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Operator-Contractor relationships (contractors can work for multiple operators)
CREATE TABLE operator_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,

  -- Relationship Details
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),
  role TEXT DEFAULT 'contractor' CHECK (role IN ('contractor', 'lead_tech', 'supervisor')),
  priority INTEGER DEFAULT 1, -- Lower = higher priority for job assignment

  -- Rates (can override contractor's default rates)
  custom_hourly_rate DECIMAL(10,2),
  custom_emergency_rate DECIMAL(10,2),

  -- Performance with this operator
  jobs_completed INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  last_job_date DATE,

  -- Settings
  can_accept_jobs BOOLEAN DEFAULT true, -- Operator can toggle this
  auto_assign_enabled BOOLEAN DEFAULT true,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  terminated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(operator_id, contractor_id)
);

-- Contractor availability schedule
CREATE TABLE contractor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,

  -- Schedule Type
  type TEXT NOT NULL CHECK (type IN ('recurring', 'override', 'time_off')),

  -- For recurring schedules
  day_of_week INTEGER, -- 0=Sunday, 1=Monday, etc.
  start_time TIME,
  end_time TIME,

  -- For overrides/time off
  specific_date DATE,
  all_day BOOLEAN DEFAULT false,

  -- Notes
  reason TEXT, -- 'Vacation', 'Personal', etc.

  -- Status
  active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractor reviews (from operators)
CREATE TABLE contractor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  work_order_id UUID, -- Reference to the specific job

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  professionalism INTEGER CHECK (professionalism >= 1 AND professionalism <= 5),
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  timeliness INTEGER CHECK (timeliness >= 1 AND timeliness <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),

  -- Review
  review_text TEXT,
  internal_notes TEXT, -- Private notes for operator

  -- Status
  visible_to_contractor BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contractors_user_id ON contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_contractors_operator_id ON contractors(operator_id);
CREATE INDEX IF NOT EXISTS idx_contractors_status ON contractors(status);
CREATE INDEX IF NOT EXISTS idx_contractors_available ON contractors(available);
CREATE INDEX IF NOT EXISTS idx_contractors_zip ON contractors(zip_code);
CREATE INDEX IF NOT EXISTS idx_contractors_trade_types ON contractors USING GIN(trade_types);

CREATE INDEX IF NOT EXISTS idx_contractor_invitations_email ON contractor_invitations(email);
CREATE INDEX IF NOT EXISTS idx_contractor_invitations_token ON contractor_invitations(token);
CREATE INDEX IF NOT EXISTS idx_contractor_invitations_operator ON contractor_invitations(operator_id);
CREATE INDEX IF NOT EXISTS idx_contractor_invitations_status ON contractor_invitations(status);

CREATE INDEX IF NOT EXISTS idx_operator_contractors_operator ON operator_contractors(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_contractors_contractor ON operator_contractors(contractor_id);

CREATE INDEX IF NOT EXISTS idx_contractor_availability_contractor ON contractor_availability(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_availability_date ON contractor_availability(specific_date);

-- Enable RLS
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contractors
CREATE POLICY "Contractors can view own profile"
  ON contractors FOR SELECT
  USING (true);

CREATE POLICY "Contractors can update own profile"
  ON contractors FOR UPDATE
  USING (true);

CREATE POLICY "System can insert contractors"
  ON contractors FOR INSERT
  WITH CHECK (true);

-- RLS Policies for invitations
CREATE POLICY "Operators can view own invitations"
  ON contractor_invitations FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage invitations"
  ON contractor_invitations FOR ALL
  USING (true);

-- RLS Policies for operator_contractors
CREATE POLICY "View operator-contractor relationships"
  ON operator_contractors FOR SELECT
  USING (true);

CREATE POLICY "Manage operator-contractor relationships"
  ON operator_contractors FOR ALL
  USING (true);

-- RLS Policies for availability
CREATE POLICY "Contractors can view own availability"
  ON contractor_availability FOR SELECT
  USING (true);

CREATE POLICY "Contractors can manage own availability"
  ON contractor_availability FOR ALL
  USING (true);

-- RLS Policies for reviews
CREATE POLICY "View contractor reviews"
  ON contractor_reviews FOR SELECT
  USING (true);

CREATE POLICY "Operators can create reviews"
  ON contractor_reviews FOR INSERT
  WITH CHECK (true);

-- Function to generate invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$;

-- Function to create contractor invitation
CREATE OR REPLACE FUNCTION create_contractor_invitation(
  p_operator_id UUID,
  p_email TEXT,
  p_trade_type TEXT DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_expires_in_days INTEGER DEFAULT 7
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_invitation_id UUID;
BEGIN
  INSERT INTO contractor_invitations (
    operator_id,
    email,
    token,
    trade_type,
    message,
    expires_at
  )
  VALUES (
    p_operator_id,
    p_email,
    generate_invitation_token(),
    p_trade_type,
    p_message,
    NOW() + (p_expires_in_days || ' days')::INTERVAL
  )
  RETURNING id INTO v_invitation_id;

  RETURN v_invitation_id;
END;
$$;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_contractor_invitation(
  p_token TEXT,
  p_user_id TEXT,
  p_contractor_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Get and validate invitation
  SELECT * INTO v_invitation
  FROM contractor_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update invitation
  UPDATE contractor_invitations
  SET status = 'accepted',
      accepted_at = NOW(),
      accepted_by = p_contractor_id
  WHERE id = v_invitation.id;

  -- Create operator-contractor relationship
  INSERT INTO operator_contractors (operator_id, contractor_id)
  VALUES (v_invitation.operator_id, p_contractor_id)
  ON CONFLICT (operator_id, contractor_id) DO NOTHING;

  -- Update contractor's primary operator if not set
  UPDATE contractors
  SET operator_id = v_invitation.operator_id
  WHERE id = p_contractor_id
    AND operator_id IS NULL;

  RETURN true;
END;
$$;

-- Function to update contractor stats
CREATE OR REPLACE FUNCTION update_contractor_stats(p_contractor_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE contractors
  SET
    total_jobs_completed = COALESCE((
      SELECT COUNT(*) FROM contractor_jobs
      WHERE contractor_id = p_contractor_id AND status = 'completed'
    ), 0),
    total_earnings = COALESCE((
      SELECT SUM(
        COALESCE(time_spent_minutes, 0) / 60.0 *
        COALESCE((SELECT hourly_rate FROM contractors WHERE id = p_contractor_id), 0)
      )
      FROM contractor_jobs
      WHERE contractor_id = p_contractor_id AND status = 'completed'
    ), 0),
    rating = COALESCE((
      SELECT AVG(rating)::DECIMAL(3,2) FROM contractor_reviews
      WHERE contractor_id = p_contractor_id AND visible_to_contractor = true
    ), 0),
    total_reviews = COALESCE((
      SELECT COUNT(*) FROM contractor_reviews
      WHERE contractor_id = p_contractor_id AND visible_to_contractor = true
    ), 0),
    last_active_at = NOW(),
    updated_at = NOW()
  WHERE id = p_contractor_id;
END;
$$;

-- Function to find available contractors for a job
CREATE OR REPLACE FUNCTION find_available_contractors(
  p_operator_id UUID,
  p_date DATE,
  p_trade_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  rating DECIMAL(3,2),
  hourly_rate DECIMAL(10,2),
  trade_types TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.rating,
    COALESCE(oc.custom_hourly_rate, c.hourly_rate) as hourly_rate,
    c.trade_types
  FROM contractors c
  JOIN operator_contractors oc ON c.id = oc.contractor_id
  WHERE oc.operator_id = p_operator_id
    AND oc.status = 'active'
    AND oc.can_accept_jobs = true
    AND c.status = 'active'
    AND c.available = true
    AND (p_trade_type IS NULL OR p_trade_type = ANY(c.trade_types))
    -- Check not on time off
    AND NOT EXISTS (
      SELECT 1 FROM contractor_availability ca
      WHERE ca.contractor_id = c.id
        AND ca.type = 'time_off'
        AND ca.specific_date = p_date
        AND ca.active = true
    )
  ORDER BY oc.priority ASC, c.rating DESC;
END;
$$;
