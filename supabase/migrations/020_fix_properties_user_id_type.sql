-- ============================================
-- 020_fix_properties_user_id_type.sql
-- Fix properties.user_id column type for Clerk
-- ============================================
--
-- Problem: properties.user_id is UUID but Clerk user IDs are TEXT
-- (e.g., "user_3651LOaYsMTWcUVU5DNTTisNESM")
--
-- This migration:
-- 1. Drops ALL RLS policies that reference properties.user_id
-- 2. Converts the column type
-- 3. Recreates permissive policies
-- ============================================

-- ============================================
-- STEP 1: Drop ALL policies that might depend on properties.user_id
-- (includes policies from migration 002 and 017)
-- ============================================

-- Properties policies (all variants)
DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;
DROP POLICY IF EXISTS "Users can create properties" ON properties;
DROP POLICY IF EXISTS "Users can create own properties" ON properties;
DROP POLICY IF EXISTS "Allow all operations on properties" ON properties;

-- System baselines policies (all variants)
DROP POLICY IF EXISTS "Users can view own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can insert own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can update own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can delete own system_baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can view own system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can insert own system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can update own system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can delete own system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Users can create system baselines" ON system_baselines;
DROP POLICY IF EXISTS "Allow all operations on system_baselines" ON system_baselines;

-- Maintenance tasks policies (all variants)
DROP POLICY IF EXISTS "Users can view own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can insert own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can update own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can delete own maintenance_tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can view own maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can insert own maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can update own maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can delete own maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Users can create maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Allow all operations on maintenance_tasks" ON maintenance_tasks;

-- Inspections policies (all variants)
DROP POLICY IF EXISTS "Users can view own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can insert own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can update own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can delete own inspections" ON inspections;
DROP POLICY IF EXISTS "Users can create inspections" ON inspections;
DROP POLICY IF EXISTS "Allow all operations on inspections" ON inspections;

-- Upgrades policies (all variants)
DROP POLICY IF EXISTS "Users can view own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can insert own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can update own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can delete own upgrades" ON upgrades;
DROP POLICY IF EXISTS "Users can create upgrades" ON upgrades;
DROP POLICY IF EXISTS "Allow all operations on upgrades" ON upgrades;

-- Cart items policies (all variants)
DROP POLICY IF EXISTS "Users can view own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart_items" ON cart_items;
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can create cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Allow all operations on cart_items" ON cart_items;

-- Preservation recommendations policies
DROP POLICY IF EXISTS "Users can view own preservation recommendations" ON preservation_recommendations;
DROP POLICY IF EXISTS "Users can create preservation recommendations" ON preservation_recommendations;
DROP POLICY IF EXISTS "Users can update own preservation recommendations" ON preservation_recommendations;
DROP POLICY IF EXISTS "Users can delete own preservation recommendations" ON preservation_recommendations;
DROP POLICY IF EXISTS "Allow all operations on preservation_recommendations" ON preservation_recommendations;

-- Portfolio equity policies
DROP POLICY IF EXISTS "Users can view own portfolio equity" ON portfolio_equity;
DROP POLICY IF EXISTS "Users can create portfolio equity" ON portfolio_equity;
DROP POLICY IF EXISTS "Users can update own portfolio equity" ON portfolio_equity;
DROP POLICY IF EXISTS "Users can delete own portfolio equity" ON portfolio_equity;
DROP POLICY IF EXISTS "Allow all operations on portfolio_equity" ON portfolio_equity;

-- Operators policies
DROP POLICY IF EXISTS "Anyone can view operators" ON operators;
DROP POLICY IF EXISTS "Users can create own operator profile" ON operators;
DROP POLICY IF EXISTS "Users can update own operator profile" ON operators;
DROP POLICY IF EXISTS "Allow all operations on operators" ON operators;

-- Property access policies
DROP POLICY IF EXISTS "Users can view property access" ON property_access;
DROP POLICY IF EXISTS "Property owners can manage access" ON property_access;
DROP POLICY IF EXISTS "Allow all operations on property_access" ON property_access;

-- User security settings policies
DROP POLICY IF EXISTS "Users can view own security settings" ON user_security_settings;
DROP POLICY IF EXISTS "Users can create own security settings" ON user_security_settings;
DROP POLICY IF EXISTS "Users can update own security settings" ON user_security_settings;
DROP POLICY IF EXISTS "Allow all operations on user_security_settings" ON user_security_settings;

-- Strategic recommendations policies
DROP POLICY IF EXISTS "Users can view own strategic recommendations" ON strategic_recommendations;
DROP POLICY IF EXISTS "Users can create strategic recommendations" ON strategic_recommendations;
DROP POLICY IF EXISTS "Users can update own strategic recommendations" ON strategic_recommendations;
DROP POLICY IF EXISTS "Allow all operations on strategic_recommendations" ON strategic_recommendations;

-- Operator stripe accounts policies
DROP POLICY IF EXISTS "Operators can view own stripe account" ON operator_stripe_accounts;
DROP POLICY IF EXISTS "Operators can manage own stripe account" ON operator_stripe_accounts;
DROP POLICY IF EXISTS "Allow all operations on operator_stripe_accounts" ON operator_stripe_accounts;

-- Wealth projections policies
DROP POLICY IF EXISTS "Users can view own wealth projections" ON wealth_projections;
DROP POLICY IF EXISTS "Users can create wealth projections" ON wealth_projections;
DROP POLICY IF EXISTS "Users can update own wealth projections" ON wealth_projections;
DROP POLICY IF EXISTS "Allow all operations on wealth_projections" ON wealth_projections;

-- Preservation impacts policies
DROP POLICY IF EXISTS "Users can view own preservation impacts" ON preservation_impacts;
DROP POLICY IF EXISTS "Users can create preservation impacts" ON preservation_impacts;
DROP POLICY IF EXISTS "Users can update own preservation impacts" ON preservation_impacts;
DROP POLICY IF EXISTS "Allow all operations on preservation_impacts" ON preservation_impacts;

-- Portfolio benchmarks policies
DROP POLICY IF EXISTS "Users can view own portfolio benchmarks" ON portfolio_benchmarks;
DROP POLICY IF EXISTS "Users can create portfolio benchmarks" ON portfolio_benchmarks;
DROP POLICY IF EXISTS "Allow all operations on portfolio_benchmarks" ON portfolio_benchmarks;

-- Capital allocations policies
DROP POLICY IF EXISTS "Users can view own capital allocations" ON capital_allocations;
DROP POLICY IF EXISTS "Users can create capital allocations" ON capital_allocations;
DROP POLICY IF EXISTS "Users can update own capital allocations" ON capital_allocations;
DROP POLICY IF EXISTS "Allow all operations on capital_allocations" ON capital_allocations;

-- ============================================
-- STEP 2: Drop views that depend on properties
-- ============================================

DROP VIEW IF EXISTS property_with_public_data;
DROP VIEW IF EXISTS property_with_regional_costs;

-- ============================================
-- STEP 3: Convert user_id from UUID to TEXT
-- ============================================

-- Drop foreign key constraint if it exists
ALTER TABLE properties
  DROP CONSTRAINT IF EXISTS properties_user_id_fkey;

-- Convert the column type
ALTER TABLE properties
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- ============================================
-- STEP 4: Recreate the views
-- ============================================

CREATE OR REPLACE VIEW property_with_public_data AS
SELECT
  p.*,
  ppd.zestimate,
  ppd.rent_zestimate,
  ppd.last_sale_price,
  ppd.last_sale_date,
  ppd.tax_assessment,
  ppd.data_source AS public_data_source,
  ppd.last_updated AS public_data_updated
FROM properties p
LEFT JOIN public_property_data ppd ON p.standardized_address_id = ppd.standardized_address_id;

CREATE OR REPLACE VIEW property_with_regional_costs AS
SELECT
  p.*,
  rc.cost_of_living_index,
  rc.construction_cost_index,
  rc.avg_labor_rate_general,
  rc.avg_hvac_replacement,
  rc.avg_roof_replacement_per_sqft,
  rc.median_home_price
FROM properties p
LEFT JOIN regional_costs rc ON p.zip_code = rc.zip_code;

COMMENT ON VIEW property_with_public_data IS 'Properties joined with public API data';
COMMENT ON VIEW property_with_regional_costs IS 'Properties joined with regional cost data';

-- ============================================
-- STEP 5: Recreate permissive RLS policies
-- (Security handled at application layer via Clerk)
-- ============================================

CREATE POLICY "Allow all operations on properties" ON properties
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on system_baselines" ON system_baselines
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on maintenance_tasks" ON maintenance_tasks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on inspections" ON inspections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on upgrades" ON upgrades
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on cart_items" ON cart_items
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on preservation_recommendations" ON preservation_recommendations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on portfolio_equity" ON portfolio_equity
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on operators" ON operators
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on property_access" ON property_access
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_security_settings" ON user_security_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on strategic_recommendations" ON strategic_recommendations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on operator_stripe_accounts" ON operator_stripe_accounts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on wealth_projections" ON wealth_projections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on preservation_impacts" ON preservation_impacts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on portfolio_benchmarks" ON portfolio_benchmarks
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on capital_allocations" ON capital_allocations
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- STEP 6: Add documentation
-- ============================================

COMMENT ON COLUMN properties.user_id IS 'Clerk user ID (TEXT) - e.g., user_abc123...';
