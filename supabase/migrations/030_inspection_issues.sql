-- ============================================
-- 030_inspection_issues.sql
-- Creates the inspection_issues table for storing individual issues
-- Found during property inspections
-- ============================================

-- ============================================
-- 1. INSPECTION ISSUES TABLE
-- Stores individual issues discovered during inspections
-- Links to inspections, properties, and optionally system_baselines
-- ============================================
CREATE TABLE IF NOT EXISTS inspection_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Required relationships
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Optional system reference
  system_id UUID REFERENCES system_baselines(id) ON DELETE SET NULL,

  -- Issue details
  issue_type TEXT NOT NULL CHECK (issue_type IN (
    'damage', 'wear', 'malfunction', 'safety_hazard',
    'code_violation', 'maintenance_needed', 'cosmetic', 'other'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,

  -- Location within property
  location_in_property TEXT,  -- e.g., "Master Bathroom", "Kitchen", "Roof - North Side"
  area TEXT,  -- e.g., "interior", "exterior", "garage", "basement"

  -- Evidence
  photo_urls TEXT[] DEFAULT '{}',

  -- Cost estimation
  estimated_cost_low DECIMAL(10,2),
  estimated_cost_high DECIMAL(10,2),

  -- Resolution tracking
  status TEXT DEFAULT 'identified' CHECK (status IN (
    'identified', 'scheduled', 'in_progress', 'resolved', 'deferred', 'wont_fix'
  )),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,  -- user_id who resolved

  -- Task linkage (if a maintenance task was created)
  linked_task_id UUID REFERENCES maintenance_tasks(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inspection_issues_inspection ON inspection_issues(inspection_id);
CREATE INDEX IF NOT EXISTS idx_inspection_issues_property ON inspection_issues(property_id);
CREATE INDEX IF NOT EXISTS idx_inspection_issues_system ON inspection_issues(system_id);
CREATE INDEX IF NOT EXISTS idx_inspection_issues_severity ON inspection_issues(severity);
CREATE INDEX IF NOT EXISTS idx_inspection_issues_status ON inspection_issues(status);
CREATE INDEX IF NOT EXISTS idx_inspection_issues_type ON inspection_issues(issue_type);

-- ============================================
-- 3. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE inspection_issues ENABLE ROW LEVEL SECURITY;

-- Users can view issues for their own properties
CREATE POLICY "Users can view own property inspection issues"
  ON inspection_issues FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()::text
    )
    OR auth.role() = 'service_role'
  );

-- Users can create issues for their own properties
CREATE POLICY "Users can create inspection issues for own properties"
  ON inspection_issues FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()::text
    )
    OR auth.role() = 'service_role'
  );

-- Users can update issues for their own properties
CREATE POLICY "Users can update own property inspection issues"
  ON inspection_issues FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()::text
    )
    OR auth.role() = 'service_role'
  );

-- Users can delete issues for their own properties
CREATE POLICY "Users can delete own property inspection issues"
  ON inspection_issues FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE user_id = auth.uid()::text
    )
    OR auth.role() = 'service_role'
  );

-- ============================================
-- 4. TRIGGER: Update issues_count on inspections
-- ============================================
CREATE OR REPLACE FUNCTION update_inspection_issues_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE inspections
    SET issues_count = (
      SELECT COUNT(*) FROM inspection_issues WHERE inspection_id = NEW.inspection_id
    )
    WHERE id = NEW.inspection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE inspections
    SET issues_count = (
      SELECT COUNT(*) FROM inspection_issues WHERE inspection_id = OLD.inspection_id
    )
    WHERE id = OLD.inspection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_inspection_issues_count ON inspection_issues;
CREATE TRIGGER trg_update_inspection_issues_count
  AFTER INSERT OR DELETE ON inspection_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_inspection_issues_count();

-- ============================================
-- 5. UPDATED_AT TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS set_updated_at_inspection_issues ON inspection_issues;
CREATE TRIGGER set_updated_at_inspection_issues
  BEFORE UPDATE ON inspection_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Done: inspection_issues table created
-- Issues count on inspections will auto-update
-- ============================================
