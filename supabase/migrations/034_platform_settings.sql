-- Migration 034: Platform Settings
-- Enables HQ admin to configure platform-wide settings

-- Create platform_settings table (key-value store)
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category column if not exists
ALTER TABLE platform_settings
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);

-- Enable RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON platform_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON platform_settings;

-- Only admins can view settings
CREATE POLICY "Admins can view settings" ON platform_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON platform_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" ON platform_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Insert default settings
INSERT INTO platform_settings (setting_key, setting_value, category, description) VALUES
  ('general', '{"platformName":"360° Method","supportEmail":"support@360method.com","maintenanceMode":false,"allowSignups":true,"requireEmailVerification":true,"defaultUserRole":"homeowner"}', 'general', 'General platform settings'),
  ('notifications', '{"sendWelcomeEmail":true,"sendInvoiceEmails":true,"sendReminderEmails":true,"adminAlertEmail":"admin@360method.com","slackWebhook":""}', 'notifications', 'Notification settings'),
  ('features', '{"enableOperatorPortal":true,"enableContractorPortal":true,"enableMarketplace":true,"enableAIFeatures":true,"enablePayments":true,"enableDemoMode":true}', 'features', 'Feature flags')
ON CONFLICT (setting_key) DO NOTHING;

-- Add comment
COMMENT ON TABLE platform_settings IS 'Platform-wide configuration settings managed by HQ admins';
