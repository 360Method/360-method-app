-- ============================================
-- 360° Method App - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. SYSTEM BASELINE
-- Tracks home systems and their condition
-- ============================================
CREATE TABLE IF NOT EXISTS system_baselines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL,
  nickname TEXT,
  brand_model TEXT,
  installation_year INTEGER,
  warranty_info TEXT,
  last_service_date DATE,
  next_service_date DATE,
  last_battery_change DATE,
  last_test_date DATE,
  condition TEXT CHECK (condition IN ('Good', 'Fair', 'Poor')),
  condition_notes TEXT,
  warning_signs_present JSONB DEFAULT '[]',
  photo_urls JSONB DEFAULT '[]',
  manual_urls JSONB DEFAULT '[]',
  estimated_lifespan_years INTEGER,
  replacement_cost_estimate DECIMAL(10,2),
  key_components JSONB DEFAULT '{}',
  lifespan_extension_total_years INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_baselines_property_id ON system_baselines(property_id);
CREATE INDEX idx_system_baselines_system_type ON system_baselines(system_type);

-- ============================================
-- 2. MAINTENANCE TASK
-- Tracks maintenance work items
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  system_type TEXT,
  source TEXT CHECK (source IN ('PRESERVATION_RECOMMENDATION', 'INSPECTION', 'MANUAL', 'SEASONAL')),
  preservation_recommendation_id UUID,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low', 'Emergency')),
  status TEXT DEFAULT 'Identified' CHECK (status IN ('Identified', 'Scheduled', 'In Progress', 'Completed', 'Deferred')),
  current_fix_cost DECIMAL(10,2),
  contractor_cost DECIMAL(10,2),
  estimated_hours DECIMAL(5,2),
  scheduled_date DATE,
  completed_date DATE,
  seasonal BOOLEAN DEFAULT false,
  recommended_completion_window TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_maintenance_tasks_property_id ON maintenance_tasks(property_id);
CREATE INDEX idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX idx_maintenance_tasks_priority ON maintenance_tasks(priority);

-- ============================================
-- 3. INSPECTION
-- Tracks property inspections
-- ============================================
CREATE TABLE IF NOT EXISTS inspections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  inspection_type TEXT CHECK (inspection_type IN ('Full', 'Seasonal', 'Area-Based')),
  status TEXT DEFAULT 'In Progress' CHECK (status IN ('In Progress', 'Completed', 'Saved')),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ,
  route_mode TEXT CHECK (route_mode IN ('physical', 'area_based')),
  checklist_items JSONB DEFAULT '[]',
  issues_count INTEGER DEFAULT 0,
  completion_percent INTEGER DEFAULT 0,
  photo_urls JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspections_property_id ON inspections(property_id);
CREATE INDEX idx_inspections_status ON inspections(status);

-- ============================================
-- 4. UPGRADE
-- Tracks property improvement projects
-- ============================================
CREATE TABLE IF NOT EXISTS upgrades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('Property Value', 'Energy Efficiency', 'Rental Appeal', 'Safety', 'Comfort')),
  description TEXT,
  current_state TEXT,
  upgraded_state TEXT,
  investment_required DECIMAL(10,2),
  annual_savings DECIMAL(10,2),
  property_value_impact DECIMAL(10,2),
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed')),
  planned_date DATE,
  completion_date DATE,
  photo_urls JSONB DEFAULT '[]',
  document_urls JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  ai_guidance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upgrades_property_id ON upgrades(property_id);
CREATE INDEX idx_upgrades_status ON upgrades(status);

-- ============================================
-- 5. CART ITEM
-- Shopping cart for service requests
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  source_type TEXT CHECK (source_type IN ('task', 'upgrade', 'custom', 'baseline_assessment', 'inspection', 'inspection_issue')),
  source_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  system_type TEXT,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  estimated_hours DECIMAL(5,2),
  estimated_cost_min DECIMAL(10,2),
  estimated_cost_max DECIMAL(10,2),
  photo_urls JSONB DEFAULT '[]',
  customer_notes TEXT,
  preferred_timeline TEXT,
  status TEXT DEFAULT 'in_cart' CHECK (status IN ('in_cart', 'checked_out')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_property_id ON cart_items(property_id);
CREATE INDEX idx_cart_items_status ON cart_items(status);

-- ============================================
-- 6. PRESERVATION RECOMMENDATION
-- AI-generated preservation recommendations
-- ============================================
CREATE TABLE IF NOT EXISTS preservation_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  system_id UUID REFERENCES system_baselines(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  intervention_type TEXT CHECK (intervention_type IN ('Preventive Maintenance', 'Repair', 'Upgrade')),
  priority TEXT CHECK (priority IN ('URGENT', 'RECOMMENDED', 'OPTIONAL')),
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DEFERRED', 'DISMISSED')),
  estimated_cost_min DECIMAL(10,2),
  estimated_cost_max DECIMAL(10,2),
  expected_lifespan_extension_years INTEGER,
  roi_multiple DECIMAL(5,2),
  recommended_deadline DATE,
  decision_date DATE,
  decision_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preservation_recommendations_property_id ON preservation_recommendations(property_id);
CREATE INDEX idx_preservation_recommendations_system_id ON preservation_recommendations(system_id);
CREATE INDEX idx_preservation_recommendations_status ON preservation_recommendations(status);

-- ============================================
-- 7. PORTFOLIO EQUITY
-- Financial equity tracking per property
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_equity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE UNIQUE,
  current_market_value DECIMAL(12,2),
  valuation_date DATE,
  valuation_source TEXT CHECK (valuation_source IN ('User Estimate', 'Zestimate', 'Professional Appraisal')),
  purchase_price DECIMAL(12,2),
  purchase_date DATE,
  mortgage_balance DECIMAL(12,2),
  mortgage_interest_rate DECIMAL(5,3),
  mortgage_payment_monthly DECIMAL(10,2),
  total_debt DECIMAL(12,2),
  equity_dollars DECIMAL(12,2),
  equity_percentage DECIMAL(5,2),
  is_rental BOOLEAN DEFAULT false,
  monthly_rent_income DECIMAL(10,2),
  monthly_operating_expenses DECIMAL(10,2),
  monthly_noi DECIMAL(10,2),
  last_updated DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_equity_property_id ON portfolio_equity(property_id);

-- ============================================
-- 8. OPERATOR
-- Service provider/contractor profiles
-- ============================================
CREATE TABLE IF NOT EXISTS operators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  service_areas JSONB DEFAULT '[]',
  specialties JSONB DEFAULT '[]',
  years_experience INTEGER,
  license_info TEXT,
  insurance_info TEXT,
  rating DECIMAL(2,1) DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  bio TEXT,
  photo_url TEXT,
  availability_status TEXT DEFAULT 'Available' CHECK (availability_status IN ('Available', 'Limited', 'Unavailable')),
  hourly_rate DECIMAL(8,2),
  service_radius_miles INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operators_user_id ON operators(user_id);

-- ============================================
-- 9. PROPERTY ACCESS
-- Sharing and permissions for properties
-- ============================================
CREATE TABLE IF NOT EXISTS property_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('Owner', 'Operator', 'Contractor', 'Viewer')),
  permissions JSONB DEFAULT '[]',
  status TEXT DEFAULT 'invited' CHECK (status IN ('active', 'invited', 'pending', 'removed')),
  invited_by TEXT,
  invitation_token TEXT,
  invitation_expires TIMESTAMPTZ,
  removed_date DATE,
  removed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_access_property_id ON property_access(property_id);
CREATE INDEX idx_property_access_user_email ON property_access(user_email);
CREATE INDEX idx_property_access_invitation_token ON property_access(invitation_token);

-- ============================================
-- 10. UPGRADE TEMPLATE
-- Pre-built upgrade project templates
-- ============================================
CREATE TABLE IF NOT EXISTS upgrade_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT CHECK (category IN ('High ROI Renovations', 'Energy Efficiency', 'Rental Income Boosters', 'Preventive Replacements', 'Curb Appeal')),
  description TEXT,
  whats_included JSONB DEFAULT '[]',
  average_cost_min DECIMAL(10,2),
  average_cost_max DECIMAL(10,2),
  typical_value_added DECIMAL(10,2),
  average_roi_percent DECIMAL(5,2),
  annual_savings DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. USER SECURITY SETTINGS
-- User account security preferences
-- ============================================
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method TEXT CHECK (two_factor_method IN ('email', 'sms', 'authenticator')),
  login_alerts_enabled BOOLEAN DEFAULT true,
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  session_timeout_minutes INTEGER DEFAULT 60,
  password_change_required BOOLEAN DEFAULT false,
  last_password_change TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_security_settings_user_id ON user_security_settings(user_id);

-- ============================================
-- 12. STRATEGIC RECOMMENDATION
-- Portfolio-level strategic recommendations
-- ============================================
CREATE TABLE IF NOT EXISTS strategic_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  recommendation_type TEXT CHECK (recommendation_type IN ('Preserve', 'Upgrade', 'Divest', 'Refinance', 'Leverage')),
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  estimated_impact DECIMAL(12,2),
  implementation_timeline TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategic_recommendations_user_id ON strategic_recommendations(user_id);
CREATE INDEX idx_strategic_recommendations_property_id ON strategic_recommendations(property_id);

-- ============================================
-- 13. SERVICE PACKAGE
-- Service tier/subscription packages
-- ============================================
CREATE TABLE IF NOT EXISTS service_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('free', 'essential', 'premium', 'elite')),
  description TEXT,
  price_monthly DECIMAL(8,2),
  features JSONB DEFAULT '[]',
  included_hours INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. OPERATOR STRIPE ACCOUNT
-- Stripe Connect for operators
-- ============================================
CREATE TABLE IF NOT EXISTS operator_stripe_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id TEXT,
  stripe_connect_status TEXT DEFAULT 'pending' CHECK (stripe_connect_status IN ('pending', 'active', 'disabled')),
  onboarding_completed BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  verification_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_operator_stripe_accounts_operator_id ON operator_stripe_accounts(operator_id);

-- ============================================
-- 15. MAINTENANCE TEMPLATE
-- Seasonal maintenance task templates
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  system_type TEXT,
  season TEXT CHECK (season IN ('Spring', 'Summer', 'Fall', 'Winter', 'Annual')),
  estimated_hours DECIMAL(5,2),
  estimated_cost DECIMAL(10,2),
  checklist_items JSONB DEFAULT '[]',
  importance_level TEXT CHECK (importance_level IN ('Critical', 'Important', 'Recommended')),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 16. WEALTH PROJECTION
-- Financial projections for portfolio
-- ============================================
CREATE TABLE IF NOT EXISTS wealth_projections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  projection_type TEXT CHECK (projection_type IN ('5_year', '10_year', '30_year')),
  projected_property_value DECIMAL(12,2),
  projected_equity DECIMAL(12,2),
  projected_annual_appreciation_rate DECIMAL(5,3),
  projected_total_noi DECIMAL(12,2),
  projection_date DATE,
  confidence_level TEXT CHECK (confidence_level IN ('High', 'Medium', 'Low')),
  assumptions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wealth_projections_user_id ON wealth_projections(user_id);
CREATE INDEX idx_wealth_projections_property_id ON wealth_projections(property_id);

-- ============================================
-- 17. WAITLIST
-- Users joining waitlist
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  zip_code TEXT,
  property_type TEXT CHECK (property_type IN ('homecare', 'propertycare', 'both')),
  source TEXT,
  notes TEXT,
  marketing_consent BOOLEAN DEFAULT false,
  consent_timestamp TIMESTAMPTZ,
  consent_ip TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'contacted', 'converted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_zip_code ON waitlist(zip_code);

-- ============================================
-- 18. PRESERVATION IMPACT
-- Measures impact of preservation actions
-- ============================================
CREATE TABLE IF NOT EXISTS preservation_impacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  system_id UUID REFERENCES system_baselines(id) ON DELETE CASCADE,
  preservation_recommendation_id UUID REFERENCES preservation_recommendations(id) ON DELETE SET NULL,
  action_taken TEXT,
  cost_spent DECIMAL(10,2),
  lifespan_extended_years INTEGER,
  replacement_cost_avoided DECIMAL(10,2),
  completion_date DATE,
  effectiveness_score DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_preservation_impacts_property_id ON preservation_impacts(property_id);
CREATE INDEX idx_preservation_impacts_system_id ON preservation_impacts(system_id);

-- ============================================
-- 19. PORTFOLIO BENCHMARK
-- Benchmarks against regional averages
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_benchmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  region TEXT,
  benchmark_type TEXT CHECK (benchmark_type IN ('Equity', 'ROI', 'Maintenance', 'Health Score')),
  user_metric DECIMAL(12,2),
  regional_average DECIMAL(12,2),
  user_rank INTEGER,
  benchmark_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_benchmarks_user_id ON portfolio_benchmarks(user_id);
CREATE INDEX idx_portfolio_benchmarks_property_id ON portfolio_benchmarks(property_id);

-- ============================================
-- 20. CAPITAL ALLOCATION
-- Capital allocation decisions
-- ============================================
CREATE TABLE IF NOT EXISTS capital_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  allocation_type TEXT CHECK (allocation_type IN ('PRESERVE', 'UPGRADE', 'MORTGAGE_PAYDOWN', 'MARKET_INVESTMENT')),
  title TEXT,
  amount_allocated DECIMAL(12,2),
  allocation_date DATE,
  expected_return_pct DECIMAL(5,2),
  expected_return_dollars DECIMAL(12,2),
  rank INTEGER,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_capital_allocations_user_id ON capital_allocations(user_id);
CREATE INDEX idx_capital_allocations_property_id ON capital_allocations(property_id);

-- ============================================
-- 21. VIDEO TUTORIAL
-- Educational video content
-- ============================================
CREATE TABLE IF NOT EXISTS video_tutorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_seconds INTEGER,
  topic TEXT CHECK (topic IN ('Baseline', 'Inspection', 'Preservation', 'Upgrade', 'Scale')),
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  sort_order INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 22. SERVICE REQUEST
-- Customer service requests
-- ============================================
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  task_id UUID REFERENCES maintenance_tasks(id) ON DELETE SET NULL,
  service_type TEXT,
  description TEXT,
  urgency TEXT CHECK (urgency IN ('Low', 'Medium', 'High', 'Emergency')),
  preferred_contact_time TEXT,
  photo_urls JSONB DEFAULT '[]',
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'In Review', 'Quoted', 'Accepted', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_property_id ON service_requests(property_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);

-- ============================================
-- 23. RESOURCE GUIDE
-- Educational resources and guides
-- ============================================
CREATE TABLE IF NOT EXISTS resource_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category TEXT CHECK (category IN ('Maintenance', 'Energy Efficiency', 'Preservation', 'Investment', 'General')),
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_read_time_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE system_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE preservation_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_equity ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_stripe_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wealth_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE preservation_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE capital_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Public read-only tables (templates, guides, etc.)
ALTER TABLE upgrade_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR USER-OWNED DATA
-- Users can only access their own property data
-- ============================================

-- System Baselines: Access via property ownership
CREATE POLICY "Users can view own system baselines" ON system_baselines
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create system baselines" ON system_baselines
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own system baselines" ON system_baselines
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own system baselines" ON system_baselines
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Maintenance Tasks: Access via property ownership
CREATE POLICY "Users can view own maintenance tasks" ON maintenance_tasks
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create maintenance tasks" ON maintenance_tasks
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own maintenance tasks" ON maintenance_tasks
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own maintenance tasks" ON maintenance_tasks
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Inspections: Access via property ownership
CREATE POLICY "Users can view own inspections" ON inspections
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create inspections" ON inspections
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own inspections" ON inspections
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own inspections" ON inspections
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Upgrades: Access via property ownership
CREATE POLICY "Users can view own upgrades" ON upgrades
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create upgrades" ON upgrades
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own upgrades" ON upgrades
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can delete own upgrades" ON upgrades
  FOR DELETE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Cart Items: Direct user ownership
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create cart items" ON cart_items
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (user_id = auth.uid());

-- Preservation Recommendations: Access via property ownership
CREATE POLICY "Users can view own preservation recommendations" ON preservation_recommendations
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create preservation recommendations" ON preservation_recommendations
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own preservation recommendations" ON preservation_recommendations
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Portfolio Equity: Access via property ownership
CREATE POLICY "Users can view own portfolio equity" ON portfolio_equity
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create portfolio equity" ON portfolio_equity
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own portfolio equity" ON portfolio_equity
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Operators: Users can view all, but only edit their own
CREATE POLICY "Anyone can view operators" ON operators
  FOR SELECT USING (true);
CREATE POLICY "Users can create own operator profile" ON operators
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own operator profile" ON operators
  FOR UPDATE USING (user_id = auth.uid());

-- Property Access: Access via property ownership or being the invited user
CREATE POLICY "Users can view property access" ON property_access
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
    OR user_email = auth.email()
  );
CREATE POLICY "Property owners can manage access" ON property_access
  FOR ALL USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- User Security Settings: Direct user ownership
CREATE POLICY "Users can view own security settings" ON user_security_settings
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own security settings" ON user_security_settings
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own security settings" ON user_security_settings
  FOR UPDATE USING (user_id = auth.uid());

-- Strategic Recommendations: Direct user ownership
CREATE POLICY "Users can view own strategic recommendations" ON strategic_recommendations
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create strategic recommendations" ON strategic_recommendations
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own strategic recommendations" ON strategic_recommendations
  FOR UPDATE USING (user_id = auth.uid());

-- Operator Stripe Accounts: Access via operator ownership
CREATE POLICY "Operators can view own stripe account" ON operator_stripe_accounts
  FOR SELECT USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );
CREATE POLICY "Operators can manage own stripe account" ON operator_stripe_accounts
  FOR ALL USING (
    operator_id IN (SELECT id FROM operators WHERE user_id = auth.uid())
  );

-- Wealth Projections: Direct user ownership
CREATE POLICY "Users can view own wealth projections" ON wealth_projections
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create wealth projections" ON wealth_projections
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own wealth projections" ON wealth_projections
  FOR UPDATE USING (user_id = auth.uid());

-- Preservation Impacts: Access via property ownership
CREATE POLICY "Users can view own preservation impacts" ON preservation_impacts
  FOR SELECT USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can create preservation impacts" ON preservation_impacts
  FOR INSERT WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can update own preservation impacts" ON preservation_impacts
  FOR UPDATE USING (
    property_id IN (SELECT id FROM properties WHERE user_id = auth.uid())
  );

-- Portfolio Benchmarks: Direct user ownership
CREATE POLICY "Users can view own portfolio benchmarks" ON portfolio_benchmarks
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create portfolio benchmarks" ON portfolio_benchmarks
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Capital Allocations: Direct user ownership
CREATE POLICY "Users can view own capital allocations" ON capital_allocations
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create capital allocations" ON capital_allocations
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own capital allocations" ON capital_allocations
  FOR UPDATE USING (user_id = auth.uid());

-- Service Requests: Direct user ownership
CREATE POLICY "Users can view own service requests" ON service_requests
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create service requests" ON service_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own service requests" ON service_requests
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- RLS POLICIES FOR PUBLIC/REFERENCE DATA
-- ============================================

-- Public read access for templates and guides
CREATE POLICY "Anyone can view upgrade templates" ON upgrade_templates
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view service packages" ON service_packages
  FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view maintenance templates" ON maintenance_templates
  FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view published video tutorials" ON video_tutorials
  FOR SELECT USING (is_published = true);
CREATE POLICY "Anyone can view published resource guides" ON resource_guides
  FOR SELECT USING (is_published = true);

-- Waitlist: Anyone can insert, no one can read (admin only via service role)
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

-- ============================================
-- AUTO-UPDATE TIMESTAMP TRIGGERS
-- ============================================

-- Create trigger function (if not exists from previous migration)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER system_baselines_updated_at BEFORE UPDATE ON system_baselines FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER inspections_updated_at BEFORE UPDATE ON inspections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER upgrades_updated_at BEFORE UPDATE ON upgrades FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER preservation_recommendations_updated_at BEFORE UPDATE ON preservation_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portfolio_equity_updated_at BEFORE UPDATE ON portfolio_equity FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER property_access_updated_at BEFORE UPDATE ON property_access FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER upgrade_templates_updated_at BEFORE UPDATE ON upgrade_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER user_security_settings_updated_at BEFORE UPDATE ON user_security_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER strategic_recommendations_updated_at BEFORE UPDATE ON strategic_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER service_packages_updated_at BEFORE UPDATE ON service_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER operator_stripe_accounts_updated_at BEFORE UPDATE ON operator_stripe_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER maintenance_templates_updated_at BEFORE UPDATE ON maintenance_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER wealth_projections_updated_at BEFORE UPDATE ON wealth_projections FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER waitlist_updated_at BEFORE UPDATE ON waitlist FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER preservation_impacts_updated_at BEFORE UPDATE ON preservation_impacts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER portfolio_benchmarks_updated_at BEFORE UPDATE ON portfolio_benchmarks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER capital_allocations_updated_at BEFORE UPDATE ON capital_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER video_tutorials_updated_at BEFORE UPDATE ON video_tutorials FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER resource_guides_updated_at BEFORE UPDATE ON resource_guides FOR EACH ROW EXECUTE FUNCTION update_updated_at();
