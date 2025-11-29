-- ============================================
-- 013_operator_leads.sql
-- Lead intake and quote management for operators
-- ============================================

-- ============================================
-- 1. OPERATOR LEADS TABLE
-- Captures cold leads from website, phone, referrals
-- ============================================
CREATE TABLE IF NOT EXISTS operator_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,

  -- Contact Info (Required)
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_email TEXT,
  CONSTRAINT contact_method_required CHECK (contact_phone IS NOT NULL OR contact_email IS NOT NULL),

  -- Property Info (Optional initially, enriched later)
  property_address TEXT,
  property_city TEXT,
  property_state TEXT,
  property_zip TEXT,
  canonical_property_id UUID REFERENCES canonical_properties(id),

  -- Auto-enriched from public data
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL(3,1),
  sqft INTEGER,
  year_built INTEGER,
  estimated_home_value DECIMAL(12,2),

  -- Lead Classification
  lead_type TEXT NOT NULL DEFAULT 'job' CHECK (lead_type IN (
    'job',       -- One-time repair or project
    'list',      -- Honey-do list (multiple small items)
    'service',   -- Ongoing HomeCare/PropertyCare interest
    'nurture'    -- Just exploring
  )),

  -- Job Details
  description TEXT,
  task_list JSONB DEFAULT '[]',  -- For honey-do: [{"item": "Fix door", "completed": false}]
  photo_urls TEXT[] DEFAULT '{}',
  urgency TEXT DEFAULT 'flexible' CHECK (urgency IN ('emergency', 'soon', 'flexible')),

  -- Lead Source
  source TEXT NOT NULL DEFAULT 'website' CHECK (source IN (
    'website',     -- Operator's embedded form
    'phone',       -- Phone call (manually entered)
    'referral',    -- Word of mouth
    'marketplace', -- 360 marketplace
    'manual'       -- Operator added manually
  )),
  source_detail TEXT,  -- "Google Ads", "Friend referral", etc.

  -- Pipeline Management
  stage TEXT DEFAULT 'new' CHECK (stage IN (
    'new',         -- Just came in
    'contacted',   -- Operator reached out
    'quoted',      -- Quote sent
    'approved',    -- Customer approved quote
    'scheduled',   -- On the calendar
    'completed',   -- Job done
    'won',         -- Converted to ongoing client
    'lost'         -- Didn't close
  )),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'hot')),
  estimated_value DECIMAL(10,2),

  -- Magic Link (for app-first experience)
  magic_token TEXT UNIQUE,
  magic_token_expires_at TIMESTAMPTZ,

  -- Follow-up
  last_contacted_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  notes TEXT,

  -- Conversion Tracking
  converted_at TIMESTAMPTZ,
  converted_user_id TEXT,           -- Clerk user ID when they create account
  converted_to_property_id UUID REFERENCES properties(id),
  lost_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. OPERATOR QUOTES TABLE
-- Quotes sent to leads
-- ============================================
CREATE TABLE IF NOT EXISTS operator_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES operator_leads(id) ON DELETE CASCADE,

  -- Quote Details
  title TEXT NOT NULL,
  description TEXT,

  -- Line Items
  line_items JSONB NOT NULL DEFAULT '[]',  -- Format: [{"description": "Fix faucet", "amount": 150, "amount_max": null}]

  -- Totals
  subtotal_min DECIMAL(10,2) NOT NULL,
  subtotal_max DECIMAL(10,2),  -- NULL if fixed price
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_min DECIMAL(10,2) NOT NULL,
  total_max DECIMAL(10,2),

  -- Notes
  notes_to_customer TEXT,
  internal_notes TEXT,

  -- Validity
  valid_until DATE,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',      -- Not yet sent
    'sent',       -- Sent to customer
    'viewed',     -- Customer opened it
    'approved',   -- Customer approved
    'declined',   -- Customer declined
    'expired'     -- Past valid_until date
  )),

  -- Magic Link
  magic_token TEXT UNIQUE,
  magic_token_expires_at TIMESTAMPTZ,

  -- Short code for URLs
  short_code TEXT UNIQUE,

  -- Tracking
  sent_at TIMESTAMPTZ,
  sent_via TEXT[] DEFAULT '{}',  -- ['email', 'sms']
  viewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Scheduling (filled when approved)
  scheduled_date DATE,
  scheduled_time_slot TEXT,  -- 'morning', 'afternoon', 'flexible'

  -- PDF
  pdf_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. LEAD ACTIVITY LOG
-- Track all interactions with a lead
-- ============================================
CREATE TABLE IF NOT EXISTS operator_lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES operator_leads(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,

  -- Activity details
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'created',      -- Lead was created
    'called',       -- Operator called
    'emailed',      -- Operator emailed
    'texted',       -- Operator texted
    'quoted',       -- Quote was sent
    'quote_viewed', -- Lead viewed quote
    'approved',     -- Quote approved
    'declined',     -- Quote declined
    'scheduled',    -- Job scheduled
    'completed',    -- Job completed
    'converted',    -- Converted to client
    'lost',         -- Lead was lost
    'note_added',   -- Internal note added
    'stage_changed' -- Pipeline stage changed
  )),

  description TEXT,
  metadata JSONB DEFAULT '{}',  -- Additional context

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT  -- Clerk user ID
);

-- ============================================
-- 4. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_operator_leads_operator ON operator_leads(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_leads_stage ON operator_leads(stage);
CREATE INDEX IF NOT EXISTS idx_operator_leads_created ON operator_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_operator_leads_magic_token ON operator_leads(magic_token) WHERE magic_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operator_leads_followup ON operator_leads(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operator_leads_zip ON operator_leads(property_zip);
CREATE INDEX IF NOT EXISTS idx_operator_leads_source ON operator_leads(source);
CREATE INDEX IF NOT EXISTS idx_operator_leads_priority ON operator_leads(priority);

CREATE INDEX IF NOT EXISTS idx_operator_quotes_operator ON operator_quotes(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_quotes_lead ON operator_quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_operator_quotes_status ON operator_quotes(status);
CREATE INDEX IF NOT EXISTS idx_operator_quotes_magic_token ON operator_quotes(magic_token) WHERE magic_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_operator_quotes_short_code ON operator_quotes(short_code) WHERE short_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_operator_lead_activities_lead ON operator_lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_operator_lead_activities_operator ON operator_lead_activities(operator_id);
CREATE INDEX IF NOT EXISTS idx_operator_lead_activities_created ON operator_lead_activities(created_at DESC);

-- ============================================
-- 5. RLS POLICIES
-- ============================================
ALTER TABLE operator_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_lead_activities ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Operators can manage their leads"
  ON operator_leads FOR ALL USING (true);

-- Quotes policies
CREATE POLICY "Operators can manage their quotes"
  ON operator_quotes FOR ALL USING (true);

-- Activities policies
CREATE POLICY "Operators can manage their lead activities"
  ON operator_lead_activities FOR ALL USING (true);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Generate a secure magic token
CREATE OR REPLACE FUNCTION generate_magic_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$;

-- Generate short code for URLs (6 chars)
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Auto-generate short code for quotes
CREATE OR REPLACE FUNCTION generate_quote_short_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.short_code IS NULL THEN
    LOOP
      new_code := generate_short_code();
      SELECT EXISTS(SELECT 1 FROM operator_quotes WHERE short_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.short_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_quote_short_code
  BEFORE INSERT ON operator_quotes
  FOR EACH ROW
  EXECUTE FUNCTION generate_quote_short_code();

-- Auto-generate magic token for leads
CREATE OR REPLACE FUNCTION generate_lead_magic_token()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.magic_token IS NULL THEN
    NEW.magic_token := generate_magic_token();
    NEW.magic_token_expires_at := NOW() + INTERVAL '30 days';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_generate_lead_magic_token
  BEFORE INSERT ON operator_leads
  FOR EACH ROW
  EXECUTE FUNCTION generate_lead_magic_token();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_operator_lead_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_operator_lead_timestamp
  BEFORE UPDATE ON operator_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_lead_timestamp();

CREATE TRIGGER trigger_update_operator_quote_timestamp
  BEFORE UPDATE ON operator_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_lead_timestamp();

-- ============================================
-- 7. ANALYTICS FUNCTIONS
-- ============================================

-- Get lead pipeline stats for an operator
CREATE OR REPLACE FUNCTION get_lead_pipeline_stats(p_operator_id UUID)
RETURNS TABLE (
  stage TEXT,
  count BIGINT,
  total_value DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ol.stage,
    COUNT(*)::BIGINT,
    COALESCE(SUM(ol.estimated_value), 0)::DECIMAL(10,2)
  FROM operator_leads ol
  WHERE ol.operator_id = p_operator_id
  GROUP BY ol.stage
  ORDER BY
    CASE ol.stage
      WHEN 'new' THEN 1
      WHEN 'contacted' THEN 2
      WHEN 'quoted' THEN 3
      WHEN 'approved' THEN 4
      WHEN 'scheduled' THEN 5
      WHEN 'completed' THEN 6
      WHEN 'won' THEN 7
      WHEN 'lost' THEN 8
    END;
END;
$$;

-- Get lead conversion metrics
CREATE OR REPLACE FUNCTION get_lead_conversion_metrics(
  p_operator_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_leads BIGINT,
  leads_contacted BIGINT,
  quotes_sent BIGINT,
  quotes_approved BIGINT,
  leads_won BIGINT,
  leads_lost BIGINT,
  total_pipeline_value DECIMAL(10,2),
  total_won_value DECIMAL(10,2),
  contact_rate DECIMAL(5,2),
  quote_rate DECIMAL(5,2),
  approval_rate DECIMAL(5,2),
  win_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total BIGINT;
  v_contacted BIGINT;
  v_quoted BIGINT;
  v_approved BIGINT;
  v_won BIGINT;
  v_lost BIGINT;
  v_pipeline DECIMAL(10,2);
  v_won_value DECIMAL(10,2);
BEGIN
  -- Get counts
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE stage NOT IN ('new')),
    COUNT(*) FILTER (WHERE stage IN ('quoted', 'approved', 'scheduled', 'completed', 'won')),
    COUNT(*) FILTER (WHERE stage IN ('approved', 'scheduled', 'completed', 'won')),
    COUNT(*) FILTER (WHERE stage = 'won'),
    COUNT(*) FILTER (WHERE stage = 'lost'),
    COALESCE(SUM(estimated_value), 0),
    COALESCE(SUM(estimated_value) FILTER (WHERE stage = 'won'), 0)
  INTO v_total, v_contacted, v_quoted, v_approved, v_won, v_lost, v_pipeline, v_won_value
  FROM operator_leads
  WHERE operator_id = p_operator_id
    AND (p_start_date IS NULL OR created_at::DATE >= p_start_date)
    AND (p_end_date IS NULL OR created_at::DATE <= p_end_date);

  RETURN QUERY SELECT
    v_total,
    v_contacted,
    v_quoted,
    v_approved,
    v_won,
    v_lost,
    v_pipeline,
    v_won_value,
    CASE WHEN v_total > 0 THEN (v_contacted::DECIMAL / v_total * 100)::DECIMAL(5,2) ELSE 0 END,
    CASE WHEN v_contacted > 0 THEN (v_quoted::DECIMAL / v_contacted * 100)::DECIMAL(5,2) ELSE 0 END,
    CASE WHEN v_quoted > 0 THEN (v_approved::DECIMAL / v_quoted * 100)::DECIMAL(5,2) ELSE 0 END,
    CASE WHEN v_total > 0 THEN (v_won::DECIMAL / v_total * 100)::DECIMAL(5,2) ELSE 0 END;
END;
$$;

-- Get leads needing follow-up
CREATE OR REPLACE FUNCTION get_leads_needing_followup(p_operator_id UUID)
RETURNS TABLE (
  id UUID,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  stage TEXT,
  priority TEXT,
  next_followup_at TIMESTAMPTZ,
  days_overdue INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ol.id,
    ol.contact_name,
    ol.contact_phone,
    ol.contact_email,
    ol.stage,
    ol.priority,
    ol.next_followup_at,
    EXTRACT(DAY FROM (NOW() - ol.next_followup_at))::INTEGER AS days_overdue
  FROM operator_leads ol
  WHERE ol.operator_id = p_operator_id
    AND ol.next_followup_at <= NOW()
    AND ol.stage NOT IN ('won', 'lost', 'completed')
  ORDER BY ol.next_followup_at ASC;
END;
$$;
