-- ============================================
-- 009_work_orders.sql
-- Work orders and contractor job assignments
-- ============================================

-- Work orders table (approved work to be done)
CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- Human-readable: WO-2024-0001

  -- References
  proposal_id UUID REFERENCES proposals(id),
  service_request_id UUID NOT NULL REFERENCES service_requests(id),
  operator_id UUID NOT NULL REFERENCES operators(id),
  property_id UUID NOT NULL REFERENCES properties(id),
  owner_id TEXT NOT NULL, -- Clerk user ID of property owner
  contractor_id UUID REFERENCES contractors(id),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Just created
    'assigned',     -- Contractor assigned
    'scheduled',    -- Date/time confirmed
    'en_route',     -- Contractor heading to site
    'in_progress',  -- Work started
    'on_hold',      -- Paused (waiting for parts, owner decision, etc.)
    'completed',    -- Work finished
    'invoiced',     -- Invoice sent
    'paid',         -- Payment received
    'cancelled'     -- Cancelled
  )),

  -- Job Details
  title TEXT NOT NULL,
  description TEXT,
  service_type TEXT, -- 'hvac', 'plumbing', etc.
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'emergency')),

  -- Property Access
  access_instructions TEXT,
  access_code TEXT,
  gate_code TEXT,
  pet_info TEXT,
  parking_instructions TEXT,

  -- Scheduling
  scheduled_date DATE,
  scheduled_time_start TIME,
  scheduled_time_end TIME,
  estimated_duration_hours DECIMAL(6,2),
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,

  -- Financials
  estimated_amount DECIMAL(10,2),
  actual_amount DECIMAL(10,2),
  materials_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  additional_charges DECIMAL(10,2) DEFAULT 0,
  additional_charges_reason TEXT,

  -- Payment
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'deposit_paid', 'partial', 'paid', 'refunded')),
  payment_method TEXT, -- 'card', 'bank', 'cash', 'check'
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,

  -- Completion
  completion_notes TEXT,
  work_performed TEXT,
  parts_used JSONB DEFAULT '[]', -- [{name, quantity, cost}]
  issues_found TEXT,
  recommendations TEXT,

  -- Customer Feedback
  owner_rating INTEGER CHECK (owner_rating >= 1 AND owner_rating <= 5),
  owner_review TEXT,
  owner_review_at TIMESTAMPTZ,

  -- Internal
  internal_notes TEXT,
  assigned_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by TEXT, -- 'owner', 'operator', 'contractor'

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contractor jobs table (contractor's view of work orders)
CREATE TABLE contractor_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'assigned' CHECK (status IN (
    'assigned',     -- Job assigned, awaiting acceptance
    'accepted',     -- Contractor accepted
    'declined',     -- Contractor declined
    'en_route',     -- Heading to job site
    'arrived',      -- At job site
    'in_progress',  -- Working on job
    'paused',       -- Temporarily paused
    'completed',    -- Job finished
    'cancelled'     -- Job cancelled
  )),

  -- Response
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,

  -- Timing
  en_route_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  pause_reason TEXT,

  -- Time Tracking
  time_spent_minutes INTEGER DEFAULT 0,
  break_minutes INTEGER DEFAULT 0,

  -- Job Notes
  notes TEXT,
  before_notes TEXT,
  after_notes TEXT,
  issues_encountered TEXT,

  -- Materials Used
  materials_used JSONB DEFAULT '[]', -- [{name, quantity, cost, receipt_url}]
  materials_total DECIMAL(10,2) DEFAULT 0,

  -- Checklist
  checklist JSONB DEFAULT '[]', -- [{item, completed, completed_at}]
  checklist_completed_count INTEGER DEFAULT 0,
  checklist_total_count INTEGER DEFAULT 0,

  -- GPS Tracking (optional)
  check_in_location JSONB, -- {lat, lng, address}
  check_out_location JSONB,

  -- Earnings
  hourly_rate DECIMAL(10,2), -- Rate for this job
  base_pay DECIMAL(10,2),
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  bonus_pay DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2),
  paid_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(work_order_id, contractor_id)
);

-- Work order status history
CREATE TABLE work_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by TEXT, -- User ID who made the change
  changed_by_type TEXT, -- 'owner', 'operator', 'contractor', 'system'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work order messages (communication thread)
CREATE TABLE work_order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('owner', 'operator', 'contractor')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  read_by JSONB DEFAULT '[]', -- [{user_id, read_at}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequence for work order numbers
CREATE SEQUENCE IF NOT EXISTS work_order_seq START WITH 1;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_work_orders_order_number ON work_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_work_orders_proposal ON work_orders(proposal_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_service_request ON work_orders(service_request_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_operator ON work_orders(operator_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_property ON work_orders(property_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_owner ON work_orders(owner_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_contractor ON work_orders(contractor_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_scheduled ON work_orders(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_work_orders_created ON work_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contractor_jobs_work_order ON contractor_jobs(work_order_id);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_contractor ON contractor_jobs(contractor_id);
CREATE INDEX IF NOT EXISTS idx_contractor_jobs_status ON contractor_jobs(status);

CREATE INDEX IF NOT EXISTS idx_work_order_status_history_wo ON work_order_status_history(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_messages_wo ON work_order_messages(work_order_id);

-- Enable RLS
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for work_orders
CREATE POLICY "View work orders"
  ON work_orders FOR SELECT
  USING (true);

CREATE POLICY "Manage work orders"
  ON work_orders FOR ALL
  USING (true);

-- RLS Policies for contractor_jobs
CREATE POLICY "View contractor jobs"
  ON contractor_jobs FOR SELECT
  USING (true);

CREATE POLICY "Manage contractor jobs"
  ON contractor_jobs FOR ALL
  USING (true);

-- RLS Policies for status history
CREATE POLICY "View status history"
  ON work_order_status_history FOR SELECT
  USING (true);

CREATE POLICY "Create status history"
  ON work_order_status_history FOR INSERT
  WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "View work order messages"
  ON work_order_messages FOR SELECT
  USING (true);

CREATE POLICY "Create work order messages"
  ON work_order_messages FOR INSERT
  WITH CHECK (true);

-- Function to generate work order number
CREATE OR REPLACE FUNCTION generate_work_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'WO-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('work_order_seq')::TEXT, 4, '0');
END;
$$;

-- Trigger to auto-generate work order number
CREATE OR REPLACE FUNCTION set_work_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_work_order_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_set_work_order_number
  BEFORE INSERT ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_work_order_number();

-- Function to track status changes
CREATE OR REPLACE FUNCTION track_work_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO work_order_status_history (
      work_order_id,
      from_status,
      to_status,
      changed_by_type,
      notes
    )
    VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      'system',
      NULL
    );

    -- Update timestamps based on status
    CASE NEW.status
      WHEN 'assigned' THEN
        NEW.assigned_at := COALESCE(NEW.assigned_at, NOW());
      WHEN 'in_progress' THEN
        NEW.started_at := COALESCE(NEW.started_at, NOW());
      WHEN 'completed' THEN
        NEW.completed_at := COALESCE(NEW.completed_at, NOW());
      WHEN 'cancelled' THEN
        NEW.cancelled_at := COALESCE(NEW.cancelled_at, NOW());
      ELSE
        NULL;
    END CASE;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_track_work_order_status
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION track_work_order_status_change();

-- Function to create work order from accepted proposal
CREATE OR REPLACE FUNCTION create_work_order_from_proposal(p_proposal_id UUID)
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

  -- Create work order
  INSERT INTO work_orders (
    proposal_id,
    service_request_id,
    operator_id,
    property_id,
    owner_id,
    title,
    description,
    estimated_amount,
    scheduled_date,
    scheduled_time_start,
    estimated_duration_hours
  )
  VALUES (
    v_proposal.id,
    v_proposal.service_request_id,
    v_proposal.operator_id,
    v_proposal.property_id,
    v_proposal.owner_id,
    v_proposal.title,
    v_proposal.description,
    v_proposal.total_amount,
    v_proposal.preferred_date,
    v_proposal.preferred_time_start,
    v_proposal.estimated_duration_hours
  )
  RETURNING id INTO v_work_order_id;

  RETURN v_work_order_id;
END;
$$;

-- Function to assign contractor to work order
CREATE OR REPLACE FUNCTION assign_contractor_to_work_order(
  p_work_order_id UUID,
  p_contractor_id UUID,
  p_hourly_rate DECIMAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_contractor_job_id UUID;
  v_rate DECIMAL(10,2);
BEGIN
  -- Get rate (use provided or contractor's default)
  SELECT COALESCE(p_hourly_rate, c.hourly_rate)
  INTO v_rate
  FROM contractors c
  WHERE c.id = p_contractor_id;

  -- Update work order
  UPDATE work_orders
  SET contractor_id = p_contractor_id,
      status = 'assigned',
      assigned_at = NOW()
  WHERE id = p_work_order_id;

  -- Create contractor job
  INSERT INTO contractor_jobs (
    work_order_id,
    contractor_id,
    hourly_rate
  )
  VALUES (
    p_work_order_id,
    p_contractor_id,
    v_rate
  )
  RETURNING id INTO v_contractor_job_id;

  -- Notify contractor
  PERFORM create_notification(
    (SELECT user_id FROM contractors WHERE id = p_contractor_id),
    'job',
    'New Job Assigned',
    'You have been assigned a new job',
    jsonb_build_object('work_order_id', p_work_order_id, 'contractor_job_id', v_contractor_job_id)
  );

  RETURN v_contractor_job_id;
END;
$$;

-- Function to calculate contractor job earnings
CREATE OR REPLACE FUNCTION calculate_contractor_job_earnings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.time_spent_minutes IS NOT NULL THEN
    NEW.base_pay := (NEW.time_spent_minutes::DECIMAL / 60) * COALESCE(NEW.hourly_rate, 0);
    NEW.total_earnings := NEW.base_pay + COALESCE(NEW.overtime_pay, 0) + COALESCE(NEW.bonus_pay, 0);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_calculate_contractor_earnings
  BEFORE UPDATE ON contractor_jobs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_contractor_job_earnings();

-- Function to update work order when contractor job completes
CREATE OR REPLACE FUNCTION sync_work_order_on_job_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE work_orders
    SET status = 'completed',
        completed_at = NOW(),
        completion_notes = NEW.after_notes,
        actual_end_time = NEW.completed_at
    WHERE id = NEW.work_order_id;

    -- Update contractor stats
    PERFORM update_contractor_stats(NEW.contractor_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_sync_work_order_on_job_complete
  AFTER UPDATE ON contractor_jobs
  FOR EACH ROW
  EXECUTE FUNCTION sync_work_order_on_job_complete();

-- Function to get work order stats for operator
CREATE OR REPLACE FUNCTION get_operator_work_order_stats(p_operator_id UUID)
RETURNS TABLE (
  total_orders INTEGER,
  pending_orders INTEGER,
  in_progress_orders INTEGER,
  completed_orders INTEGER,
  total_revenue DECIMAL(12,2),
  avg_completion_time_hours DECIMAL(6,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_orders,
    COUNT(*) FILTER (WHERE status IN ('pending', 'assigned', 'scheduled'))::INTEGER as pending_orders,
    COUNT(*) FILTER (WHERE status = 'in_progress')::INTEGER as in_progress_orders,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_orders,
    SUM(actual_amount) FILTER (WHERE status = 'completed') as total_revenue,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/3600) FILTER (WHERE status = 'completed')::DECIMAL(6,2) as avg_completion_time_hours
  FROM work_orders
  WHERE operator_id = p_operator_id;
END;
$$;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE work_order_messages;
