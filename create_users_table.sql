-- Run this SQL in the Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/xrvguskdvrhcbjiejgqr/sql/new

-- Create users table for Clerk authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create permissive policy
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

-- Verify it was created
SELECT 'users table created successfully!' as status;
