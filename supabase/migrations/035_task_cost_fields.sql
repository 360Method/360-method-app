-- Migration 035: Consolidate task cost and time fields
-- Adds missing columns that frontend code expects

-- Add actual_cost if not exists (for completed task costs)
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2);

-- Add time_spent_hours if not exists (for tracking actual hours worked)
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS time_spent_hours DECIMAL(5,2);

-- Add prevented_cost if not exists (for ROI calculation)
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS prevented_cost DECIMAL(10,2);

-- Add execution_method if not exists (DIY, operator, contractor)
ALTER TABLE maintenance_tasks
ADD COLUMN IF NOT EXISTS execution_method TEXT CHECK (execution_method IN ('DIY', '360_Operator', 'External_Contractor', 'Self'));

-- Add comments
COMMENT ON COLUMN maintenance_tasks.actual_cost IS 'Actual cost incurred after task completion';
COMMENT ON COLUMN maintenance_tasks.time_spent_hours IS 'Actual hours spent on task';
COMMENT ON COLUMN maintenance_tasks.prevented_cost IS 'Estimated cost prevented by completing this maintenance';
COMMENT ON COLUMN maintenance_tasks.execution_method IS 'How the task was executed: DIY, 360_Operator, External_Contractor, or Self';

-- Create index for cost analysis
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_actual_cost
ON maintenance_tasks(actual_cost)
WHERE actual_cost IS NOT NULL;
