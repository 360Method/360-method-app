-- ============================================
-- 008_proposals.sql
-- Proposals/quotes from operators to property owners
-- ============================================

-- Proposals table (operator responses to service requests)
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL, -- Clerk user ID of property owner

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'viewed', 'accepted', 'declined', 'expired', 'withdrawn')),

  -- Proposal Details
  title TEXT NOT NULL,
  description TEXT,
  package_type TEXT CHECK (package_type IN ('basic', 'standard', 'premium', 'custom')),

  -- Pricing - Line Items (for itemized quotes)
  line_items JSONB DEFAULT '[]',
  -- Example: [{"description": "Replace thermostat", "quantity": 1, "unit_price": 150, "total": 150}]

  -- Pricing - Summary
  labor_hours DECIMAL(10,2),
  labor_rate DECIMAL(10,2),
  labor_total DECIMAL(10,2),
  materials_cost DECIMAL(10,2),
  equipment_fee DECIMAL(10,2) DEFAULT 0,
  travel_fee DECIMAL(10,2) DEFAULT 0,
  permit_fees DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2),
  tax_rate DECIMAL(5,4) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  discount_reason TEXT,
  total_amount DECIMAL(10,2) NOT NULL,

  -- Payment Terms
  payment_terms TEXT DEFAULT 'due_on_completion', -- 'due_on_completion', '50_upfront', 'net_30'
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount DECIMAL(10,2),
  deposit_paid BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,

  -- Scheduling
  estimated_duration TEXT, -- '2-3 hours', '1 day', '3-5 days'
  estimated_duration_hours DECIMAL(6,2),
  available_dates JSONB, -- ['2024-01-15', '2024-01-16', '2024-01-17']
  preferred_date DATE,
  preferred_time_start TIME,
  preferred_time_end TIME,
  scheduling_notes TEXT,

  -- Warranty & Guarantees
  warranty_labor_days INTEGER DEFAULT 30,
  warranty_parts_days INTEGER DEFAULT 90,
  warranty_details TEXT,
  satisfaction_guarantee BOOLEAN DEFAULT true,

  -- Terms & Conditions
  terms_and_conditions TEXT,
  inclusions TEXT[], -- ['All labor', 'Standard parts', 'Cleanup']
  exclusions TEXT[], -- ['Permits', 'Structural work', 'Code upgrades']
  special_conditions TEXT,

  -- Files
  attachments JSONB DEFAULT '[]', -- [{name, url, type}]

  -- Tracking
  viewed_at TIMESTAMPTZ,
  viewed_count INTEGER DEFAULT 0,
  valid_until TIMESTAMPTZ, -- When the proposal expires
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  withdrawn_at TIMESTAMPTZ,
  withdrawn_reason TEXT,

  -- Internal Notes (operator only)
  internal_notes TEXT,
  cost_breakdown JSONB DEFAULT '{}', -- Operator's actual costs
  profit_margin DECIMAL(5,2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ -- When proposal was sent to owner

);

-- Proposal revisions (track changes to proposals)
CREATE TABLE proposal_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  changes_summary TEXT,
  previous_total DECIMAL(10,2),
  new_total DECIMAL(10,2),
  full_snapshot JSONB, -- Complete proposal data at time of revision
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposal templates (for operators to quickly create proposals)
CREATE TABLE proposal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_type TEXT, -- 'hvac', 'plumbing', etc.
  description TEXT,
  default_line_items JSONB DEFAULT '[]',
  default_labor_hours DECIMAL(10,2),
  default_labor_rate DECIMAL(10,2),
  default_materials_cost DECIMAL(10,2),
  default_warranty_labor_days INTEGER DEFAULT 30,
  default_warranty_parts_days INTEGER DEFAULT 90,
  inclusions TEXT[],
  exclusions TEXT[],
  terms_and_conditions TEXT,
  active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Proposal comments (for communication between owner and operator)
CREATE TABLE proposal_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk user ID
  user_type TEXT NOT NULL CHECK (user_type IN ('owner', 'operator')),
  comment TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_proposals_service_request ON proposals(service_request_id);
CREATE INDEX IF NOT EXISTS idx_proposals_operator ON proposals(operator_id);
CREATE INDEX IF NOT EXISTS idx_proposals_property ON proposals(property_id);
CREATE INDEX IF NOT EXISTS idx_proposals_owner ON proposals(owner_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created ON proposals(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_proposal_revisions_proposal ON proposal_revisions(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_templates_operator ON proposal_templates(operator_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal ON proposal_comments(proposal_id);

-- Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proposals
CREATE POLICY "Owners can view proposals for their properties"
  ON proposals FOR SELECT
  USING (true);

CREATE POLICY "Operators can view own proposals"
  ON proposals FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage own proposals"
  ON proposals FOR ALL
  USING (true);

-- RLS Policies for revisions
CREATE POLICY "View proposal revisions"
  ON proposal_revisions FOR SELECT
  USING (true);

CREATE POLICY "Create proposal revisions"
  ON proposal_revisions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for templates
CREATE POLICY "Operators can view own templates"
  ON proposal_templates FOR SELECT
  USING (true);

CREATE POLICY "Operators can manage own templates"
  ON proposal_templates FOR ALL
  USING (true);

-- RLS Policies for comments
CREATE POLICY "View proposal comments"
  ON proposal_comments FOR SELECT
  USING (true);

CREATE POLICY "Create proposal comments"
  ON proposal_comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Update own comments"
  ON proposal_comments FOR UPDATE
  USING (true);

-- Function to calculate proposal totals
CREATE OR REPLACE FUNCTION calculate_proposal_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_line_items_total DECIMAL(10,2) := 0;
BEGIN
  -- Calculate line items total
  IF NEW.line_items IS NOT NULL AND jsonb_array_length(NEW.line_items) > 0 THEN
    SELECT COALESCE(SUM((item->>'total')::DECIMAL), 0)
    INTO v_line_items_total
    FROM jsonb_array_elements(NEW.line_items) AS item;
  END IF;

  -- Calculate labor total
  NEW.labor_total := COALESCE(NEW.labor_hours, 0) * COALESCE(NEW.labor_rate, 0);

  -- Calculate subtotal
  NEW.subtotal := COALESCE(v_line_items_total, 0) +
                  COALESCE(NEW.labor_total, 0) +
                  COALESCE(NEW.materials_cost, 0) +
                  COALESCE(NEW.equipment_fee, 0) +
                  COALESCE(NEW.travel_fee, 0) +
                  COALESCE(NEW.permit_fees, 0);

  -- Calculate tax
  NEW.tax_amount := NEW.subtotal * COALESCE(NEW.tax_rate, 0);

  -- Calculate total
  NEW.total_amount := NEW.subtotal + NEW.tax_amount - COALESCE(NEW.discount_amount, 0);

  RETURN NEW;
END;
$$;

-- Trigger to auto-calculate totals
CREATE TRIGGER tr_calculate_proposal_totals
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION calculate_proposal_totals();

-- Function to create proposal revision on update
CREATE OR REPLACE FUNCTION create_proposal_revision()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only create revision if total changed
  IF OLD.total_amount IS DISTINCT FROM NEW.total_amount THEN
    INSERT INTO proposal_revisions (
      proposal_id,
      revision_number,
      changes_summary,
      previous_total,
      new_total,
      full_snapshot
    )
    VALUES (
      NEW.id,
      COALESCE((SELECT MAX(revision_number) + 1 FROM proposal_revisions WHERE proposal_id = NEW.id), 1),
      'Price updated',
      OLD.total_amount,
      NEW.total_amount,
      to_jsonb(OLD)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for revision tracking
CREATE TRIGGER tr_create_proposal_revision
  AFTER UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION create_proposal_revision();

-- Function to accept proposal and create work order
CREATE OR REPLACE FUNCTION accept_proposal(p_proposal_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_proposal RECORD;
  v_work_order_id UUID;
BEGIN
  -- Get proposal
  SELECT * INTO v_proposal FROM proposals WHERE id = p_proposal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Proposal not found';
  END IF;

  IF v_proposal.status != 'pending' AND v_proposal.status != 'viewed' THEN
    RAISE EXCEPTION 'Proposal cannot be accepted in current status';
  END IF;

  -- Update proposal status
  UPDATE proposals
  SET status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_proposal_id;

  -- Decline other proposals for the same service request
  UPDATE proposals
  SET status = 'declined',
      decline_reason = 'Another proposal was accepted',
      declined_at = NOW(),
      updated_at = NOW()
  WHERE service_request_id = v_proposal.service_request_id
    AND id != p_proposal_id
    AND status IN ('pending', 'viewed');

  -- Update service request status
  UPDATE service_requests
  SET status = 'accepted'
  WHERE id = v_proposal.service_request_id;

  -- Create work order (will be handled by work_orders migration)
  -- For now, just return the proposal ID
  RETURN p_proposal_id;
END;
$$;

-- Function to get proposal stats for operator
CREATE OR REPLACE FUNCTION get_operator_proposal_stats(p_operator_id UUID)
RETURNS TABLE (
  total_proposals INTEGER,
  pending_proposals INTEGER,
  accepted_proposals INTEGER,
  declined_proposals INTEGER,
  total_value DECIMAL(12,2),
  accepted_value DECIMAL(12,2),
  acceptance_rate DECIMAL(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_proposals,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_proposals,
    COUNT(*) FILTER (WHERE status = 'accepted')::INTEGER as accepted_proposals,
    COUNT(*) FILTER (WHERE status = 'declined')::INTEGER as declined_proposals,
    SUM(total_amount) as total_value,
    SUM(total_amount) FILTER (WHERE status = 'accepted') as accepted_value,
    CASE
      WHEN COUNT(*) FILTER (WHERE status IN ('accepted', 'declined')) > 0
      THEN (COUNT(*) FILTER (WHERE status = 'accepted')::DECIMAL /
            COUNT(*) FILTER (WHERE status IN ('accepted', 'declined')) * 100)::DECIMAL(5,2)
      ELSE 0
    END as acceptance_rate
  FROM proposals
  WHERE operator_id = p_operator_id;
END;
$$;

-- Enable realtime for proposal comments
ALTER PUBLICATION supabase_realtime ADD TABLE proposal_comments;
