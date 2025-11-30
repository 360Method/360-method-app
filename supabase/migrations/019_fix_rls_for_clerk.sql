-- ============================================
-- 019_fix_rls_for_clerk.sql
-- Fix RLS Policies for Clerk Authentication
-- ============================================
--
-- Problem: Migration 017 re-introduced RLS policies using auth.uid(),
-- but this app uses Clerk for authentication, not Supabase Auth.
-- auth.uid() always returns NULL, causing all operations to fail.
--
-- Solution: Use permissive policies. Authorization is handled at the
-- application layer through Clerk. The anon key has limited access
-- and the app filters data by user_id in queries.
-- ============================================

-- ============================================
-- PROPERTIES: Permissive policies for Clerk
-- ============================================
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
DROP POLICY IF EXISTS "Allow all operations on properties" ON properties;

-- Recreate permissive policy
CREATE POLICY "Allow all operations on properties" ON properties
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- SYSTEM_BASELINES: Permissive policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can insert own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can update own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can delete own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Allow all operations on system_baselines" ON system_baselines;

CREATE POLICY "Allow all operations on system_baselines" ON system_baselines
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- MAINTENANCE_TASKS: Permissive policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can insert own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can update own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can delete own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Allow all operations on maintenance_tasks" ON maintenance_tasks;

CREATE POLICY "Allow all operations on maintenance_tasks" ON maintenance_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- INSPECTIONS: Permissive policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can insert own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can update own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can delete own inspections" ON inspections;
DROP POLICY IF EXISTS "Allow all operations on inspections" ON inspections;

CREATE POLICY "Allow all operations on inspections" ON inspections
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- UPGRADES: Permissive policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can insert own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can update own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can delete own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Allow all operations on upgrades" ON upgrades;

CREATE POLICY "Allow all operations on upgrades" ON upgrades
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- CART_ITEMS: Permissive policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Allow all operations on cart_items" ON cart_items;

CREATE POLICY "Allow all operations on cart_items" ON cart_items
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Migration complete!
--
-- Note: Security is enforced at the application layer:
-- - Clerk handles authentication
-- - App queries filter by user_id
-- - API routes validate user ownership
-- ============================================
