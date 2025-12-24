-- Migration 041: Repair/ensure all AI enrichment columns exist
-- This migration uses DO blocks to handle any errors gracefully

DO $$
BEGIN
    -- From migration 031 - cascade risk columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'cascade_risk_score') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN cascade_risk_score INTEGER CHECK (cascade_risk_score >= 0 AND cascade_risk_score <= 10);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'cascade_risk_reason') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN cascade_risk_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'has_cascade_alert') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN has_cascade_alert BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'delayed_fix_cost') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN delayed_fix_cost DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'cost_impact_reason') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN cost_impact_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'diy_cost') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN diy_cost DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'urgency_timeline') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN urgency_timeline TEXT;
    END IF;

    -- From migration 040 - additional AI enrichment columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'diy_difficulty') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN diy_difficulty TEXT CHECK (diy_difficulty IN ('Easy', 'Medium', 'Hard'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'diy_time_hours') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN diy_time_hours DECIMAL(5,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'service_call_minimum') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN service_call_minimum DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'operator_cost') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN operator_cost DECIMAL(10,2);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'key_warning') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN key_warning TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'ai_sow') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN ai_sow TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'ai_tools_needed') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN ai_tools_needed JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'ai_materials_needed') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN ai_materials_needed JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'ai_video_tutorials') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN ai_video_tutorials JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'maintenance_tasks' AND column_name = 'ai_enrichment_completed') THEN
        ALTER TABLE maintenance_tasks ADD COLUMN ai_enrichment_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_cascade_risk
ON maintenance_tasks(cascade_risk_score)
WHERE cascade_risk_score IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_high_cascade_risk
ON maintenance_tasks(cascade_risk_score)
WHERE cascade_risk_score >= 7;

CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_ai_enrichment
ON maintenance_tasks(ai_enrichment_completed)
WHERE ai_enrichment_completed = false;
