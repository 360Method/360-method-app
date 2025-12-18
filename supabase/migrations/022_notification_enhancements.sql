-- ============================================
-- 022_notification_enhancements.sql
-- Add missing notification tables and columns
-- ============================================

-- Create user_notification_settings table (master controls)
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  email_notifications_enabled BOOLEAN DEFAULT true,
  push_notifications_enabled BOOLEAN DEFAULT true,
  in_app_notifications_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  quiet_hours_timezone TEXT DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure push_subscriptions table exists (may have been skipped in migration 005)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to push_subscriptions table
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS keys_p256dh TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS keys_auth TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'web';
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS device_name TEXT;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS browser TEXT;

-- Add enhanced columns to notifications table for richer notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_label TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS dismissed BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS push_sent BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL;

-- Index for user_notification_settings
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user ON user_notification_settings(user_id);

-- Index for push_subscriptions active status
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(user_id, active);

-- Index for notification priority
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(user_id, priority);

-- Enable RLS on user_notification_settings
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_notification_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_notification_settings' AND policyname = 'Users can view own notification settings'
  ) THEN
    CREATE POLICY "Users can view own notification settings"
      ON user_notification_settings FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_notification_settings' AND policyname = 'Users can manage own notification settings'
  ) THEN
    CREATE POLICY "Users can manage own notification settings"
      ON user_notification_settings FOR ALL
      USING (true);
  END IF;
END $$;

-- Function to get or create user notification settings
CREATE OR REPLACE FUNCTION get_or_create_user_notification_settings(p_user_id TEXT)
RETURNS user_notification_settings
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings user_notification_settings;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings
  FROM user_notification_settings
  WHERE user_id = p_user_id;

  -- If not found, create default settings
  IF NOT FOUND THEN
    INSERT INTO user_notification_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;

  RETURN v_settings;
END;
$$;

-- Function to update user notification settings
CREATE OR REPLACE FUNCTION update_user_notification_settings(
  p_user_id TEXT,
  p_email_enabled BOOLEAN DEFAULT NULL,
  p_push_enabled BOOLEAN DEFAULT NULL,
  p_in_app_enabled BOOLEAN DEFAULT NULL,
  p_quiet_start TIME DEFAULT NULL,
  p_quiet_end TIME DEFAULT NULL
)
RETURNS user_notification_settings
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings user_notification_settings;
BEGIN
  -- Ensure settings exist
  PERFORM get_or_create_user_notification_settings(p_user_id);

  -- Update settings
  UPDATE user_notification_settings
  SET
    email_notifications_enabled = COALESCE(p_email_enabled, email_notifications_enabled),
    push_notifications_enabled = COALESCE(p_push_enabled, push_notifications_enabled),
    in_app_notifications_enabled = COALESCE(p_in_app_enabled, in_app_notifications_enabled),
    quiet_hours_start = COALESCE(p_quiet_start, quiet_hours_start),
    quiet_hours_end = COALESCE(p_quiet_end, quiet_hours_end),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_settings;

  RETURN v_settings;
END;
$$;

-- Function to check if user is in quiet hours
CREATE OR REPLACE FUNCTION is_user_in_quiet_hours(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_settings user_notification_settings;
  v_current_time TIME;
  v_in_quiet BOOLEAN;
BEGIN
  SELECT * INTO v_settings
  FROM user_notification_settings
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Get current time in user's timezone
  v_current_time := (NOW() AT TIME ZONE COALESCE(v_settings.quiet_hours_timezone, 'America/New_York'))::TIME;

  -- Check if in quiet hours (handles overnight quiet hours like 22:00 - 08:00)
  IF v_settings.quiet_hours_start > v_settings.quiet_hours_end THEN
    -- Overnight quiet hours
    v_in_quiet := v_current_time >= v_settings.quiet_hours_start OR v_current_time <= v_settings.quiet_hours_end;
  ELSE
    -- Same-day quiet hours
    v_in_quiet := v_current_time >= v_settings.quiet_hours_start AND v_current_time <= v_settings.quiet_hours_end;
  END IF;

  RETURN v_in_quiet;
END;
$$;
