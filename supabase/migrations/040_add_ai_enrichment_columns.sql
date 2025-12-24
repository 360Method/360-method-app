-- Migration 040: Add remaining AI enrichment columns to maintenance_tasks
-- These columns support the full AI task enrichment feature

-- Add DIY-related columns
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS diy_difficulty TEXT CHECK (diy_difficulty IN ('Easy', 'Medium', 'Hard')),
ADD COLUMN IF NOT EXISTS diy_time_hours DECIMAL(5,2);

-- Add professional service columns
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS service_call_minimum DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS operator_cost DECIMAL(10,2);

-- Add AI analysis insights
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS key_warning TEXT,
ADD COLUMN IF NOT EXISTS ai_sow TEXT,
ADD COLUMN IF NOT EXISTS ai_tools_needed JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_materials_needed JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_video_tutorials JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS ai_enrichment_completed BOOLEAN DEFAULT false;

-- Add comments explaining the columns
COMMENT ON COLUMN maintenance_tasks.diy_difficulty IS 'DIY difficulty level: Easy, Medium, or Hard';
COMMENT ON COLUMN maintenance_tasks.diy_time_hours IS 'Estimated hours for DIY repair';
COMMENT ON COLUMN maintenance_tasks.service_call_minimum IS 'Typical service call fee in this market';
COMMENT ON COLUMN maintenance_tasks.operator_cost IS 'Estimated cost through maintenance membership service';
COMMENT ON COLUMN maintenance_tasks.key_warning IS 'One-sentence warning about the most critical risk';
COMMENT ON COLUMN maintenance_tasks.ai_sow IS 'AI-generated scope of work';
COMMENT ON COLUMN maintenance_tasks.ai_tools_needed IS 'JSON array of tools needed for DIY repair';
COMMENT ON COLUMN maintenance_tasks.ai_materials_needed IS 'JSON array of materials needed for repair';
COMMENT ON COLUMN maintenance_tasks.ai_video_tutorials IS 'JSON array of relevant video tutorials with title and URL';
COMMENT ON COLUMN maintenance_tasks.ai_enrichment_completed IS 'True when AI enrichment has been run on this task';

-- Create index for AI enrichment status
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_ai_enrichment
ON maintenance_tasks(ai_enrichment_completed)
WHERE ai_enrichment_completed = false;
