-- ============================================
-- SECURITY FIX: Remove Development RLS Policies
-- These policies allowed anonymous access to all data
-- ============================================

-- Drop dev policies on properties
DROP POLICY IF EXISTS "DEV: Allow anonymous read on properties" ON properties;
DROP POLICY IF EXISTS "DEV: Allow anonymous insert on properties" ON properties;
DROP POLICY IF EXISTS "DEV: Allow anonymous update on properties" ON properties;
DROP POLICY IF EXISTS "DEV: Allow anonymous delete on properties" ON properties;

-- Drop dev policies on system_baselines
DROP POLICY IF EXISTS "DEV: Allow anonymous read on system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "DEV: Allow anonymous insert on system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "DEV: Allow anonymous update on system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "DEV: Allow anonymous delete on system_baselines" ON system_baselines;

-- Drop dev policies on maintenance_tasks
DROP POLICY IF EXISTS "DEV: Allow anonymous read on maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "DEV: Allow anonymous insert on maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "DEV: Allow anonymous update on maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "DEV: Allow anonymous delete on maintenance_tasks" ON maintenance_tasks;

-- Drop dev policies on inspections
DROP POLICY IF EXISTS "DEV: Allow anonymous read on inspections" ON inspections;
DROP POLICY IF EXISTS "DEV: Allow anonymous insert on inspections" ON inspections;
DROP POLICY IF EXISTS "DEV: Allow anonymous update on inspections" ON inspections;
DROP POLICY IF EXISTS "DEV: Allow anonymous delete on inspections" ON inspections;

-- Drop dev policies on upgrades
DROP POLICY IF EXISTS "DEV: Allow anonymous read on upgrades" ON upgrades;
DROP POLICY IF EXISTS "DEV: Allow anonymous insert on upgrades" ON upgrades;
DROP POLICY IF EXISTS "DEV: Allow anonymous update on upgrades" ON upgrades;
DROP POLICY IF EXISTS "DEV: Allow anonymous delete on upgrades" ON upgrades;

-- Drop dev policies on cart_items
DROP POLICY IF EXISTS "DEV: Allow anonymous read on cart_items" ON cart_items;
DROP POLICY IF EXISTS "DEV: Allow anonymous insert on cart_items" ON cart_items;
DROP POLICY IF EXISTS "DEV: Allow anonymous update on cart_items" ON cart_items;
DROP POLICY IF EXISTS "DEV: Allow anonymous delete on cart_items" ON cart_items;

-- ============================================
-- SECURITY: Add Production RLS Policies
-- Users can only access their own data
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROPERTIES: Users can only access their own properties
-- ============================================
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
CREATE POLICY "Users can view own properties" ON properties
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
CREATE POLICY "Users can insert own properties" ON properties
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own properties" ON properties;
CREATE POLICY "Users can update own properties" ON properties
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
CREATE POLICY "Users can delete own properties" ON properties
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- SYSTEM_BASELINES: Access through property ownership
-- ============================================
DROP POLICY IF EXISTS "Users can view own system_baselines" ON system_baselines;
CREATE POLICY "Users can view own system_baselines" ON system_baselines
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own system_baselines" ON system_baselines;
CREATE POLICY "Users can insert own system_baselines" ON system_baselines
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own system_baselines" ON system_baselines;
CREATE POLICY "Users can update own system_baselines" ON system_baselines
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own system_baselines" ON system_baselines;
CREATE POLICY "Users can delete own system_baselines" ON system_baselines
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- ============================================
-- MAINTENANCE_TASKS: Access through property ownership
-- ============================================
DROP POLICY IF EXISTS "Users can view own maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "Users can view own maintenance_tasks" ON maintenance_tasks
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "Users can insert own maintenance_tasks" ON maintenance_tasks
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "Users can update own maintenance_tasks" ON maintenance_tasks
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own maintenance_tasks" ON maintenance_tasks;
CREATE POLICY "Users can delete own maintenance_tasks" ON maintenance_tasks
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- ============================================
-- INSPECTIONS: Access through property ownership
-- ============================================
DROP POLICY IF EXISTS "Users can view own inspections" ON inspections;
CREATE POLICY "Users can view own inspections" ON inspections
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own inspections" ON inspections;
CREATE POLICY "Users can insert own inspections" ON inspections
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own inspections" ON inspections;
CREATE POLICY "Users can update own inspections" ON inspections
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own inspections" ON inspections;
CREATE POLICY "Users can delete own inspections" ON inspections
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- ============================================
-- UPGRADES: Access through property ownership
-- ============================================
DROP POLICY IF EXISTS "Users can view own upgrades" ON upgrades;
CREATE POLICY "Users can view own upgrades" ON upgrades
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own upgrades" ON upgrades;
CREATE POLICY "Users can insert own upgrades" ON upgrades
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own upgrades" ON upgrades;
CREATE POLICY "Users can update own upgrades" ON upgrades
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own upgrades" ON upgrades;
CREATE POLICY "Users can delete own upgrades" ON upgrades
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- ============================================
-- CART_ITEMS: Users can only access their own cart
-- ============================================
DROP POLICY IF EXISTS "Users can view own cart_items" ON cart_items;
CREATE POLICY "Users can view own cart_items" ON cart_items
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own cart_items" ON cart_items;
CREATE POLICY "Users can insert own cart_items" ON cart_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cart_items" ON cart_items;
CREATE POLICY "Users can update own cart_items" ON cart_items
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own cart_items" ON cart_items;
CREATE POLICY "Users can delete own cart_items" ON cart_items
  FOR DELETE USING (user_id = auth.uid());
