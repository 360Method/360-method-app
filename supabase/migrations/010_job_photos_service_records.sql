-- ============================================
-- 010_job_photos_service_records.sql
-- Job photos and property service records
-- ============================================

-- Job photos table
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References (one of these must be set)
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  contractor_job_id UUID REFERENCES contractor_jobs(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  system_id UUID REFERENCES system_baselines(id) ON DELETE SET NULL,

  -- Photo Details
  photo_type TEXT NOT NULL CHECK (photo_type IN (
    'before',       -- Before work started
    'during',       -- Work in progress
    'after',        -- After work completed
    'issue',        -- Problem/damage found
    'materials',    -- Parts/materials used
    'receipt',      -- Receipt/invoice
    'inspection',   -- Inspection photo
    'general'       -- General documentation
  )),

  -- File Info
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'job-photos',
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,

  -- Metadata
  caption TEXT,
  description TEXT,
  tags TEXT[],

  -- Location (optional)
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),

  -- Timestamps
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by TEXT, -- User ID who uploaded
  uploaded_by_type TEXT CHECK (uploaded_by_type IN ('owner', 'operator', 'contractor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure at least one reference is set
  CONSTRAINT job_photos_reference_check CHECK (
    work_order_id IS NOT NULL OR
    contractor_job_id IS NOT NULL OR
    property_id IS NOT NULL
  )
);

-- Service records table (completed work history on property)
CREATE TABLE service_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  system_id UUID REFERENCES system_baselines(id) ON DELETE SET NULL,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE SET NULL,

  -- Service Details
  service_type TEXT NOT NULL CHECK (service_type IN (
    'repair',           -- Fix something broken
    'maintenance',      -- Routine maintenance
    'inspection',       -- Professional inspection
    'replacement',      -- Replace component/system
    'installation',     -- New installation
    'upgrade',          -- Improvement/upgrade
    'emergency',        -- Emergency service
    'cleaning',         -- Cleaning service
    'other'             -- Other service
  )),

  -- Job Info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'hvac', 'plumbing', 'electrical', 'roofing', etc.

  -- Who did the work
  performed_by TEXT NOT NULL CHECK (performed_by IN (
    'owner_diy',        -- Property owner did it themselves
    'operator',         -- 360° Method operator
    'contractor',       -- Contractor via operator
    'external',         -- External contractor (not via platform)
    'home_warranty',    -- Home warranty service
    'manufacturer'      -- Manufacturer warranty service
  )),
  performer_name TEXT, -- Name of company/person
  performer_phone TEXT,
  performer_email TEXT,
  operator_id UUID REFERENCES operators(id),
  contractor_id UUID REFERENCES contractors(id),

  -- Costs
  cost DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  materials_cost DECIMAL(10,2),
  parts_used JSONB DEFAULT '[]', -- [{name, part_number, cost, quantity}]
  payment_method TEXT,
  receipt_url TEXT,

  -- Timing
  service_date DATE NOT NULL,
  service_start_time TIME,
  service_end_time TIME,
  duration_hours DECIMAL(6,2),

  -- Results
  outcome TEXT, -- 'success', 'partial', 'ongoing', 'referred'
  work_performed TEXT,
  issues_found TEXT,
  recommendations TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  follow_up_notes TEXT,
  follow_up_date DATE,

  -- Warranty Info
  warranty_provided BOOLEAN DEFAULT false,
  warranty_labor_days INTEGER,
  warranty_parts_days INTEGER,
  warranty_until DATE,
  warranty_details TEXT,
  warranty_claim_number TEXT,

  -- Documentation
  documents JSONB DEFAULT '[]', -- [{name, url, type}]
  photos JSONB DEFAULT '[]', -- [{url, caption, type}]
  before_photos TEXT[], -- Photo URLs
  after_photos TEXT[], -- Photo URLs

  -- Impact on Property
  affects_property_value BOOLEAN DEFAULT false,
  estimated_value_impact DECIMAL(10,2),
  extends_system_life_years DECIMAL(4,2),

  -- Internal
  notes TEXT,
  is_verified BOOLEAN DEFAULT false, -- Operator verified the work was done
  verified_by TEXT,
  verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT -- User ID who created
);

-- Service record tags (for categorization and search)
CREATE TABLE service_record_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_record_id UUID NOT NULL REFERENCES service_records(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_record_id, tag)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_photos_work_order ON job_photos(work_order_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_contractor_job ON job_photos(contractor_job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_property ON job_photos(property_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_type ON job_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_job_photos_created ON job_photos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_records_property ON service_records(property_id);
CREATE INDEX IF NOT EXISTS idx_service_records_system ON service_records(system_id);
CREATE INDEX IF NOT EXISTS idx_service_records_work_order ON service_records(work_order_id);
CREATE INDEX IF NOT EXISTS idx_service_records_service_type ON service_records(service_type);
CREATE INDEX IF NOT EXISTS idx_service_records_category ON service_records(category);
CREATE INDEX IF NOT EXISTS idx_service_records_date ON service_records(service_date DESC);
CREATE INDEX IF NOT EXISTS idx_service_records_performed_by ON service_records(performed_by);

CREATE INDEX IF NOT EXISTS idx_service_record_tags_record ON service_record_tags(service_record_id);
CREATE INDEX IF NOT EXISTS idx_service_record_tags_tag ON service_record_tags(tag);

-- Enable RLS
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_record_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_photos
CREATE POLICY "View job photos"
  ON job_photos FOR SELECT
  USING (true);

CREATE POLICY "Manage job photos"
  ON job_photos FOR ALL
  USING (true);

-- RLS Policies for service_records
CREATE POLICY "View service records"
  ON service_records FOR SELECT
  USING (true);

CREATE POLICY "Manage service records"
  ON service_records FOR ALL
  USING (true);

-- RLS Policies for tags
CREATE POLICY "View service record tags"
  ON service_record_tags FOR SELECT
  USING (true);

CREATE POLICY "Manage service record tags"
  ON service_record_tags FOR ALL
  USING (true);

-- Function to create service record from completed work order
CREATE OR REPLACE FUNCTION create_service_record_from_work_order(p_work_order_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_work_order RECORD;
  v_contractor_job RECORD;
  v_service_record_id UUID;
BEGIN
  -- Get work order
  SELECT * INTO v_work_order
  FROM work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order not found';
  END IF;

  -- Get contractor job if exists
  SELECT * INTO v_contractor_job
  FROM contractor_jobs
  WHERE work_order_id = p_work_order_id
  LIMIT 1;

  -- Create service record
  INSERT INTO service_records (
    property_id,
    work_order_id,
    service_type,
    title,
    description,
    category,
    performed_by,
    performer_name,
    operator_id,
    contractor_id,
    cost,
    labor_cost,
    materials_cost,
    parts_used,
    service_date,
    duration_hours,
    work_performed,
    issues_found,
    recommendations,
    warranty_provided,
    notes
  )
  VALUES (
    v_work_order.property_id,
    v_work_order.id,
    COALESCE(
      CASE v_work_order.priority
        WHEN 'emergency' THEN 'emergency'
        ELSE 'repair'
      END,
      'repair'
    ),
    v_work_order.title,
    v_work_order.description,
    v_work_order.service_type,
    CASE
      WHEN v_work_order.contractor_id IS NOT NULL THEN 'contractor'
      ELSE 'operator'
    END,
    COALESCE(
      (SELECT o.company_name FROM operators o WHERE o.id = v_work_order.operator_id),
      'Unknown'
    ),
    v_work_order.operator_id,
    v_work_order.contractor_id,
    COALESCE(v_work_order.actual_amount, v_work_order.estimated_amount),
    v_work_order.labor_cost,
    v_work_order.materials_cost,
    COALESCE(v_work_order.parts_used, '[]'),
    COALESCE(v_work_order.scheduled_date, NOW()::DATE),
    CASE
      WHEN v_contractor_job.time_spent_minutes IS NOT NULL
      THEN v_contractor_job.time_spent_minutes::DECIMAL / 60
      ELSE NULL
    END,
    v_work_order.work_performed,
    v_contractor_job.issues_encountered,
    v_work_order.recommendations,
    true,
    v_work_order.completion_notes
  )
  RETURNING id INTO v_service_record_id;

  -- Copy photos
  INSERT INTO job_photos (property_id, work_order_id, photo_type, storage_path, caption, taken_at)
  SELECT
    v_work_order.property_id,
    v_work_order.id,
    photo_type,
    storage_path,
    caption,
    taken_at
  FROM job_photos
  WHERE contractor_job_id = v_contractor_job.id;

  RETURN v_service_record_id;
END;
$$;

-- Trigger to create service record when work order is completed
CREATE OR REPLACE FUNCTION auto_create_service_record()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Check if service record already exists
    IF NOT EXISTS (SELECT 1 FROM service_records WHERE work_order_id = NEW.id) THEN
      PERFORM create_service_record_from_work_order(NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_auto_create_service_record
  AFTER UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_service_record();

-- Function to get property service history
CREATE OR REPLACE FUNCTION get_property_service_history(
  p_property_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  service_type TEXT,
  title TEXT,
  category TEXT,
  service_date DATE,
  cost DECIMAL(10,2),
  performed_by TEXT,
  performer_name TEXT,
  outcome TEXT,
  photo_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.id,
    sr.service_type,
    sr.title,
    sr.category,
    sr.service_date,
    sr.cost,
    sr.performed_by,
    sr.performer_name,
    sr.outcome,
    (SELECT COUNT(*)::INTEGER FROM job_photos jp
     WHERE jp.work_order_id = sr.work_order_id OR
           (jp.property_id = p_property_id AND jp.created_at >= sr.service_date AND jp.created_at < sr.service_date + INTERVAL '1 day'))
  FROM service_records sr
  WHERE sr.property_id = p_property_id
  ORDER BY sr.service_date DESC
  LIMIT p_limit;
END;
$$;

-- Function to get service summary by category
CREATE OR REPLACE FUNCTION get_property_service_summary(p_property_id UUID)
RETURNS TABLE (
  category TEXT,
  total_services INTEGER,
  total_cost DECIMAL(12,2),
  last_service_date DATE,
  avg_cost DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sr.category,
    COUNT(*)::INTEGER as total_services,
    SUM(sr.cost) as total_cost,
    MAX(sr.service_date) as last_service_date,
    AVG(sr.cost)::DECIMAL(10,2) as avg_cost
  FROM service_records sr
  WHERE sr.property_id = p_property_id
  GROUP BY sr.category
  ORDER BY total_cost DESC;
END;
$$;

-- Function to update system baseline based on service records
CREATE OR REPLACE FUNCTION update_system_from_service_record()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update system's last service date
  IF NEW.system_id IS NOT NULL THEN
    UPDATE system_baselines
    SET
      last_service_date = NEW.service_date,
      condition = CASE
        WHEN NEW.service_type = 'replacement' THEN 'excellent'
        WHEN NEW.service_type = 'repair' AND condition IN ('poor', 'fair') THEN 'fair'
        ELSE condition
      END,
      updated_at = NOW()
    WHERE id = NEW.system_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_update_system_from_service
  AFTER INSERT ON service_records
  FOR EACH ROW
  EXECUTE FUNCTION update_system_from_service_record();
