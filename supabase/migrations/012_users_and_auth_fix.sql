-- ============================================
-- 012_users_and_auth_fix.sql
-- Fix Clerk/Supabase Auth Incompatibility
-- ============================================
--
-- Problem: This app uses Clerk for authentication but the database
-- was designed for Supabase Auth. This migration:
-- 1. Creates a 'users' table for Clerk user sync
-- 2. Converts user_id columns from UUID to TEXT (Clerk uses TEXT IDs)
-- 3. Replaces auth.uid() RLS policies with permissive policies
--    (We use service role key, auth handled at app layer)
-- ============================================

-- ============================================
-- PHASE 1: Create users table for Clerk sync
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID (e.g., "user_2abc123...")
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  roles TEXT[] DEFAULT '{owner}',
  active_role TEXT DEFAULT 'owner',
  is_admin BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);
CREATE INDEX IF NOT EXISTS idx_users_active_role ON users(active_role);

-- Updated_at trigger for users
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permissive policy for users (service role bypasses RLS)
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PHASE 2: Convert properties.user_id from UUID to TEXT
-- ============================================

-- Drop existing foreign key constraint
ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS properties_user_id_fkey;

-- Convert column type
ALTER TABLE properties
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 3: Convert cart_items.user_id from UUID to TEXT
-- ============================================

ALTER TABLE cart_items
  DROP CONSTRAINT IF EXISTS cart_items_user_id_fkey;

ALTER TABLE cart_items
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 4: Convert preservation_recommendations.decision_by_user_id
-- ============================================

ALTER TABLE preservation_recommendations
  DROP CONSTRAINT IF EXISTS preservation_recommendations_decision_by_user_id_fkey;

ALTER TABLE preservation_recommendations
  ALTER COLUMN decision_by_user_id TYPE TEXT USING decision_by_user_id::TEXT;

-- ============================================
-- PHASE 5: Convert user_security_settings.user_id
-- ============================================

ALTER TABLE user_security_settings
  DROP CONSTRAINT IF EXISTS user_security_settings_user_id_fkey;

ALTER TABLE user_security_settings
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 6: Convert strategic_recommendations.user_id
-- ============================================

ALTER TABLE strategic_recommendations
  DROP CONSTRAINT IF EXISTS strategic_recommendations_user_id_fkey;

ALTER TABLE strategic_recommendations
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 7: Convert wealth_projections.user_id
-- ============================================

ALTER TABLE wealth_projections
  DROP CONSTRAINT IF EXISTS wealth_projections_user_id_fkey;

ALTER TABLE wealth_projections
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 8: Convert portfolio_benchmarks.user_id
-- ============================================

ALTER TABLE portfolio_benchmarks
  DROP CONSTRAINT IF EXISTS portfolio_benchmarks_user_id_fkey;

ALTER TABLE portfolio_benchmarks
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 9: Convert capital_allocations.user_id
-- ============================================

ALTER TABLE capital_allocations
  DROP CONSTRAINT IF EXISTS capital_allocations_user_id_fkey;

ALTER TABLE capital_allocations
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 10: Convert service_requests.user_id
-- ============================================

ALTER TABLE service_requests
  DROP CONSTRAINT IF EXISTS service_requests_user_id_fkey;

ALTER TABLE service_requests
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- PHASE 11: Convert operators.user_id (from 002 migration)
-- Note: 006 migration recreates operators with TEXT,
-- but we need to handle if running on older schema
-- ============================================

-- Only convert if the column is UUID type
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'operators'
    AND column_name = 'user_id'
    AND data_type = 'uuid'
  ) THEN
    ALTER TABLE operators
      DROP CONSTRAINT IF EXISTS operators_user_id_fkey;
    ALTER TABLE operators
      ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- ============================================
-- PHASE 12: Drop old RLS policies that use auth.uid()
-- Replace with permissive policies (Option B)
-- ============================================

-- Properties policies
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can create own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

CREATE POLICY "Allow all operations on properties" ON properties
  FOR ALL USING (true) WITH CHECK (true);

-- Cart items policies
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can create cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

CREATE POLICY "Allow all operations on cart_items" ON cart_items
  FOR ALL USING (true) WITH CHECK (true);

-- Preservation recommendations policies
DROP POLICY IF EXISTS "Users can view own preservation recommendations" ON preservation_recommendations;
DROP POLICY IF EXISTS "Users can create preservation recommendations" ON preservation_recommendations;
DROP POLICY IF EXISTS "Users can update own preservation recommendations" ON preservation_recommendations;

CREATE POLICY "Allow all operations on preservation_recommendations" ON preservation_recommendations
  FOR ALL USING (true) WITH CHECK (true);

-- User security settings policies
DROP POLICY IF EXISTS "Users can view own security settings" ON user_security_settings;
DROP POLICY IF EXISTS "Users can create own security settings" ON user_security_settings;
DROP POLICY IF EXISTS "Users can update own security settings" ON user_security_settings;

CREATE POLICY "Allow all operations on user_security_settings" ON user_security_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Strategic recommendations policies
DROP POLICY IF EXISTS "Users can view own strategic recommendations" ON strategic_recommendations;
DROP POLICY IF EXISTS "Users can create strategic recommendations" ON strategic_recommendations;
DROP POLICY IF EXISTS "Users can update own strategic recommendations" ON strategic_recommendations;

CREATE POLICY "Allow all operations on strategic_recommendations" ON strategic_recommendations
  FOR ALL USING (true) WITH CHECK (true);

-- Wealth projections policies
DROP POLICY IF EXISTS "Users can view own wealth projections" ON wealth_projections;
DROP POLICY IF EXISTS "Users can create wealth projections" ON wealth_projections;
DROP POLICY IF EXISTS "Users can update own wealth projections" ON wealth_projections;

CREATE POLICY "Allow all operations on wealth_projections" ON wealth_projections
  FOR ALL USING (true) WITH CHECK (true);

-- Portfolio benchmarks policies
DROP POLICY IF EXISTS "Users can view own portfolio benchmarks" ON portfolio_benchmarks;
DROP POLICY IF EXISTS "Users can create portfolio benchmarks" ON portfolio_benchmarks;

CREATE POLICY "Allow all operations on portfolio_benchmarks" ON portfolio_benchmarks
  FOR ALL USING (true) WITH CHECK (true);

-- Capital allocations policies
DROP POLICY IF EXISTS "Users can view own capital allocations" ON capital_allocations;
DROP POLICY IF EXISTS "Users can create capital allocations" ON capital_allocations;
DROP POLICY IF EXISTS "Users can update own capital allocations" ON capital_allocations;

CREATE POLICY "Allow all operations on capital_allocations" ON capital_allocations
  FOR ALL USING (true) WITH CHECK (true);

-- Service requests policies
DROP POLICY IF EXISTS "Users can view own service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can create service requests" ON service_requests;
DROP POLICY IF EXISTS "Users can update own service requests" ON service_requests;

CREATE POLICY "Allow all operations on service_requests" ON service_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Operators policies
DROP POLICY IF EXISTS "Anyone can view operators" ON operators;
DROP POLICY IF EXISTS "Users can create own operator profile" ON operators;
DROP POLICY IF EXISTS "Users can update own operator profile" ON operators;

CREATE POLICY "Allow all operations on operators" ON operators
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PHASE 13: Update RLS for property-linked tables
-- These tables use property_id, not user_id directly
-- ============================================

-- System baselines
DROP POLICY IF EXISTS "Users can view own system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can create system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can update own system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can delete own system baselines" ON system_baselines;

CREATE POLICY "Allow all operations on system_baselines" ON system_baselines
  FOR ALL USING (true) WITH CHECK (true);

-- Maintenance tasks
DROP POLICY IF EXISTS "Users can view own maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can create maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can update own maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can delete own maintenance tasks" ON maintenance_tasks;

CREATE POLICY "Allow all operations on maintenance_tasks" ON maintenance_tasks
  FOR ALL USING (true) WITH CHECK (true);

-- Inspections
DROP POLICY IF EXISTS "Users can view own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can create inspections" ON inspections;
DROP POLICY IF EXISTS "Users can update own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can delete own inspections" ON inspections;

CREATE POLICY "Allow all operations on inspections" ON inspections
  FOR ALL USING (true) WITH CHECK (true);

-- Upgrades
DROP POLICY IF EXISTS "Users can view own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can create upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can update own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can delete own upgrades" ON upgrades;

CREATE POLICY "Allow all operations on upgrades" ON upgrades
  FOR ALL USING (true) WITH CHECK (true);

-- Portfolio equity
DROP POLICY IF EXISTS "Users can view own portfolio equity" ON portfolio_equity;
DROP POLICY IF EXISTS "Users can create portfolio equity" ON portfolio_equity;
DROP POLICY IF EXISTS "Users can update own portfolio equity" ON portfolio_equity;

CREATE POLICY "Allow all operations on portfolio_equity" ON portfolio_equity
  FOR ALL USING (true) WITH CHECK (true);

-- Property access
DROP POLICY IF EXISTS "Users can view property access" ON property_access;
DROP POLICY IF EXISTS "Property owners can manage access" ON property_access;

CREATE POLICY "Allow all operations on property_access" ON property_access
  FOR ALL USING (true) WITH CHECK (true);

-- Operator stripe accounts
DROP POLICY IF EXISTS "Operators can view own stripe account" ON operator_stripe_accounts;
DROP POLICY IF EXISTS "Operators can manage own stripe account" ON operator_stripe_accounts;

CREATE POLICY "Allow all operations on operator_stripe_accounts" ON operator_stripe_accounts
  FOR ALL USING (true) WITH CHECK (true);

-- Preservation impacts
DROP POLICY IF EXISTS "Users can view own preservation impacts" ON preservation_impacts;
DROP POLICY IF EXISTS "Users can create preservation impacts" ON preservation_impacts;
DROP POLICY IF EXISTS "Users can update own preservation impacts" ON preservation_impacts;

CREATE POLICY "Allow all operations on preservation_impacts" ON preservation_impacts
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PHASE 14: Add comments for documentation
-- ============================================

COMMENT ON TABLE users IS 'User profiles synced from Clerk authentication. Primary key is Clerk user ID (TEXT).';
COMMENT ON COLUMN users.id IS 'Clerk user ID (e.g., user_2abc123...)';
COMMENT ON COLUMN users.roles IS 'Array of user roles: owner, operator, contractor, admin';
COMMENT ON COLUMN users.active_role IS 'Currently active role for portal switching';
COMMENT ON COLUMN users.metadata IS 'Additional Clerk public_metadata synced from Clerk';

COMMENT ON COLUMN properties.user_id IS 'Clerk user ID (TEXT) of property owner';

-- ============================================
-- Migration complete!
--
-- Next steps:
-- 1. Deploy Clerk webhook Edge Function to sync users
-- 2. Update frontend to sync user on login
-- 3. Backfill existing Clerk users to users table
-- ============================================
