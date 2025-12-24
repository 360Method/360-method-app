-- Migration 042: Fix execution_method constraint to allow 'Contractor' value
-- The frontend uses 'Contractor' but the database constraint only allows 'External_Contractor'

-- Drop the existing constraint
ALTER TABLE maintenance_tasks
DROP CONSTRAINT IF EXISTS maintenance_tasks_execution_method_check;

-- Add updated constraint that includes 'Contractor'
ALTER TABLE maintenance_tasks
ADD CONSTRAINT maintenance_tasks_execution_method_check
CHECK (execution_method IN ('DIY', '360_Operator', 'External_Contractor', 'Contractor', 'Self'));

COMMENT ON COLUMN maintenance_tasks.execution_method IS 'How the task will be executed: DIY, 360_Operator, External_Contractor, Contractor, or Self';
