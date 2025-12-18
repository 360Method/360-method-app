-- ============================================
-- 016_fix_users_and_subscriptions.sql
-- Creates users and user_subscriptions tables for Clerk auth
-- ============================================

-- ============================================
-- DROP DUPLICATE TABLES FROM 015_payments.sql
-- These tables were created with UUID user_id (auth.users)
-- but we need TEXT user_id for Clerk authentication
-- ============================================
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;

-- ============================================
-- 1. USERS TABLE (for Clerk sync)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Clerk user ID (e.g., "user_2abc123...")
  email TEXT UNIQUE,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  tier TEXT DEFAULT 'free',
  billing_cycle TEXT,
  stripe_customer_id TEXT,
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
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permissive policy for users (service role bypasses RLS)
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 2. USER SUBSCRIPTIONS TABLE
-- Note: Using TEXT for user_id to match Clerk IDs
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Clerk user ID
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  tier TEXT CHECK (tier IN ('free', 'homeowner_plus', 'good', 'better', 'best', 'essential', 'premium', 'elite')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Indexes for user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Enable RLS
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Permissive policy (service role bypasses RLS)
DROP POLICY IF EXISTS "Allow all operations on user_subscriptions" ON user_subscriptions;
CREATE POLICY "Allow all operations on user_subscriptions" ON user_subscriptions
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 3. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Clerk user ID
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,

  -- Amounts in cents
  amount_total INTEGER NOT NULL DEFAULT 0,
  amount_platform_fee INTEGER DEFAULT 0,
  amount_operator INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'usd',

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'canceled')),

  -- Transaction type
  type TEXT NOT NULL CHECK (type IN ('subscription', 'invoice', 'service_package', 'one_time')),

  -- Related entities
  invoice_id UUID,
  operator_id UUID,
  property_id UUID,
  subscription_id UUID,

  -- Additional data
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Refund tracking
  refund_amount INTEGER DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on transactions" ON transactions;
CREATE POLICY "Allow all operations on transactions" ON transactions
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 4. PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT, -- Clerk user ID
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,

  -- Card details (from Stripe)
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Status
  is_default BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for payment_methods
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer ON payment_methods(stripe_customer_id);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on payment_methods" ON payment_methods;
CREATE POLICY "Allow all operations on payment_methods" ON payment_methods
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. WEBHOOK EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT DEFAULT 'stripe',
  payload JSONB NOT NULL,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'processing', 'processed', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  received_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_event_id ON webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Enable RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on webhook_events" ON webhook_events;
CREATE POLICY "Allow all operations on webhook_events" ON webhook_events
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 6. PLATFORM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on platform_settings" ON platform_settings;
CREATE POLICY "Allow all operations on platform_settings" ON platform_settings
  FOR ALL USING (true) WITH CHECK (true);

-- Insert default platform settings for Stripe
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('platform_fee_percent', '10', 'number', 'Platform fee percentage for operator payments'),
  ('stripe_mode', 'test', 'string', 'Stripe mode: test or live')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- Done!
-- ============================================
