-- ============================================
-- 014_operator_clients.sql
-- Existing client management and migration
-- ============================================

-- ============================================
-- 1. OPERATOR CLIENTS TABLE
-- For existing clients (not leads)
-- ============================================

CREATE TABLE IF NOT EXISTS operator_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,

  -- Contact Info
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  CONSTRAINT client_contact_required CHECK (contact_phone IS NOT NULL OR contact_email IS NOT NULL),

  -- Property (required for clients)
  property_address TEXT NOT NULL,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT NOT NULL,

  -- Linked Records (after migration to app)
  user_id TEXT,  -- Clerk user ID when they join app
  property_id UUID REFERENCES properties(id),

  -- Client Status
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active',     -- Currently serviced
    'inactive',   -- No recent service
    'past',       -- Haven't used in 1+ year
    'churned'     -- Left for competitor
  )),

  -- Service Relationship
  service_type TEXT CHECK (service_type IN ('homecare', 'propertycare', 'on_demand')),
  service_tier TEXT CHECK (service_tier IN ('basic', 'essential', 'premium', 'elite')),
  service_start_date DATE,
  last_service_date DATE,

  -- Historical Data
  total_jobs_completed INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,

  -- App Migration Status
  migration_status TEXT DEFAULT 'pending' CHECK (migration_status IN (
    'pending',       -- Not yet invited
    'invited',       -- Invitation sent
    'viewed',        -- Clicked link
    'registered',    -- Created account
    'active_user'    -- Using the app
  )),
  invitation_sent_at TIMESTAMPTZ,
  invitation_token TEXT UNIQUE,
  invitation_expires_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,

  -- Notes
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Access info
  gate_code TEXT,
  alarm_code TEXT,
  pet_info TEXT,
  access_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. IMPORTED SERVICE HISTORY
-- Past service records for migration
-- ============================================

CREATE TABLE IF NOT EXISTS imported_service_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES operator_clients(id) ON DELETE CASCADE,

  -- Service Details
  service_date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,  -- 'repair', 'maintenance', 'project', 'inspection'

  -- Financials
  amount DECIMAL(10,2),
  paid BOOLEAN DEFAULT true,

  -- After Migration (linked to real service record)
  converted_to_service_record_id UUID REFERENCES service_records(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_operator_clients_operator ON operator_clients(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_clients_status ON operator_clients(status);
CREATE INDEX IF NOT EXISTS idx_operator_clients_migration ON operator_clients(migration_status);
CREATE INDEX IF NOT EXISTS idx_operator_clients_zip ON operator_clients(property_zip);
CREATE INDEX IF NOT EXISTS idx_operator_clients_invitation ON operator_clients(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operator_clients_user ON operator_clients(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_imported_history_client ON imported_service_history(client_id);
CREATE INDEX IF NOT EXISTS idx_imported_history_date ON imported_service_history(service_date DESC);

-- ============================================
-- 4. RLS POLICIES
-- ============================================

ALTER TABLE operator_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE imported_service_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Operators can manage their clients" ON operator_clients;
DROP POLICY IF EXISTS "Operators can manage imported history" ON imported_service_history;

CREATE POLICY "Operators can manage their clients"
  ON operator_clients FOR ALL USING (true);

CREATE POLICY "Operators can manage imported history"
  ON imported_service_history FOR ALL USING (true);

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Generate invitation token
CREATE OR REPLACE FUNCTION generate_client_invitation_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.invitation_token IS NULL AND NEW.migration_status = 'invited' THEN
    NEW.invitation_token := encode(gen_random_bytes(32), 'base64');
    NEW.invitation_token := regexp_replace(NEW.invitation_token, '[/+=]', '', 'g');
    NEW.invitation_expires_at := NOW() + INTERVAL '30 days';
    NEW.invitation_sent_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_generate_client_invitation ON operator_clients;

CREATE TRIGGER trigger_generate_client_invitation
  BEFORE INSERT OR UPDATE ON operator_clients
  FOR EACH ROW
  WHEN (NEW.migration_status = 'invited' AND NEW.invitation_token IS NULL)
  EXECUTE FUNCTION generate_client_invitation_token();

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_operator_client_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_operator_client_timestamp ON operator_clients;

CREATE TRIGGER trigger_update_operator_client_timestamp
  BEFORE UPDATE ON operator_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_client_timestamp();

-- ============================================
-- 6. MIGRATION STATS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_client_migration_stats(p_operator_id UUID)
RETURNS TABLE (
  total_clients BIGINT,
  pending_invites BIGINT,
  invited BIGINT,
  registered BIGINT,
  active_users BIGINT,
  migration_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total BIGINT;
  v_pending BIGINT;
  v_invited BIGINT;
  v_registered BIGINT;
  v_active BIGINT;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE migration_status = 'pending'),
    COUNT(*) FILTER (WHERE migration_status = 'invited'),
    COUNT(*) FILTER (WHERE migration_status = 'registered'),
    COUNT(*) FILTER (WHERE migration_status = 'active_user')
  INTO v_total, v_pending, v_invited, v_registered, v_active
  FROM operator_clients
  WHERE operator_id = p_operator_id;

  RETURN QUERY SELECT
    v_total,
    v_pending,
    v_invited,
    v_registered,
    v_active,
    CASE WHEN v_total > 0
      THEN ((v_registered + v_active)::DECIMAL / v_total * 100)::DECIMAL(5,2)
      ELSE 0
    END;
END;
$$;

-- ============================================
-- 7. ADD SLUG COLUMN TO OPERATORS (if not exists)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operators' AND column_name = 'slug') THEN
    ALTER TABLE operators ADD COLUMN slug TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operators' AND column_name = 'logo_url') THEN
    ALTER TABLE operators ADD COLUMN logo_url TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'operators' AND column_name = 'primary_color') THEN
    ALTER TABLE operators ADD COLUMN primary_color TEXT DEFAULT '#2563eb';
  END IF;
END $$;

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_operators_slug ON operators(slug) WHERE slug IS NOT NULL;

-- Function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_operator_slug(business_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(business_name, '[^a-zA-Z0-9\s]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  final_slug := base_slug;

  -- Check for uniqueness, add number if needed
  WHILE EXISTS(SELECT 1 FROM operators WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;
