-- =====================================================
-- 025: Mailchimp Integration
-- =====================================================
-- Adds tables for syncing contacts to Mailchimp and tracking webhook events
-- Users are automatically queued for sync on signup via database trigger

-- =====================================================
-- 1. Mailchimp Contacts Table
-- Tracks sync status for each contact sent to Mailchimp
-- =====================================================
CREATE TABLE IF NOT EXISTS mailchimp_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('user', 'lead', 'notification_request')),
  source_id uuid NOT NULL,
  email text NOT NULL,
  mailchimp_member_id text,
  list_id text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'subscribed', 'unsubscribed', 'cleaned', 'pending_confirmation', 'transactional', 'failed')),
  tags text[] DEFAULT '{}',
  merge_fields jsonb DEFAULT '{}',
  last_synced_at timestamptz,
  sync_error text,
  sync_attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email, list_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mailchimp_contacts_source ON mailchimp_contacts(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_mailchimp_contacts_email ON mailchimp_contacts(email);
CREATE INDEX IF NOT EXISTS idx_mailchimp_contacts_status ON mailchimp_contacts(status);

-- =====================================================
-- 2. Mailchimp Events Table
-- Stores webhook events from Mailchimp (unsubscribes, bounces, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS mailchimp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  email text NOT NULL,
  list_id text,
  payload jsonb DEFAULT '{}',
  processed boolean DEFAULT false,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for unprocessed events
CREATE INDEX IF NOT EXISTS idx_mailchimp_events_unprocessed ON mailchimp_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_mailchimp_events_email ON mailchimp_events(email);

-- =====================================================
-- 3. Mailchimp Sync Queue Table
-- Queue for batch processing syncs to Mailchimp
-- =====================================================
CREATE TABLE IF NOT EXISTS mailchimp_sync_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL CHECK (action IN ('add', 'update', 'remove', 'tag')),
  email text NOT NULL,
  list_id text NOT NULL,
  payload jsonb DEFAULT '{}',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority integer DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  scheduled_for timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Index for processing queue
CREATE INDEX IF NOT EXISTS idx_mailchimp_queue_pending ON mailchimp_sync_queue(status, priority DESC, scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_mailchimp_queue_email ON mailchimp_sync_queue(email);

-- =====================================================
-- 4. Platform Settings for Mailchimp Config
-- Use existing platform_settings table from migration 016
-- (has columns: setting_key, setting_value, setting_type, description)
-- =====================================================

-- Insert default Mailchimp settings (list ID to be configured via env/admin)
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description)
VALUES
  ('mailchimp_enabled', 'true', 'boolean', 'Enable/disable Mailchimp sync'),
  ('mailchimp_default_list_id', '', 'string', 'Default Mailchimp audience/list ID')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 5. Trigger: Auto-queue new users for Mailchimp sync
-- =====================================================
CREATE OR REPLACE FUNCTION queue_user_mailchimp_sync()
RETURNS TRIGGER AS $$
DECLARE
  list_id text;
BEGIN
  -- Get the configured list ID
  SELECT setting_value INTO list_id FROM platform_settings WHERE setting_key = 'mailchimp_default_list_id';

  -- Only queue if list ID is configured
  IF list_id IS NOT NULL AND list_id != '' THEN
    INSERT INTO mailchimp_sync_queue (action, email, list_id, payload, priority)
    VALUES (
      'add',
      NEW.email,
      list_id,
      jsonb_build_object(
        'source_type', 'user',
        'source_id', NEW.id,
        'merge_fields', jsonb_build_object(
          'FNAME', COALESCE(NEW.first_name, ''),
          'LNAME', COALESCE(NEW.last_name, ''),
          'ROLE', COALESCE(NEW.active_role, 'owner')
        ),
        'tags', ARRAY['signup', COALESCE(NEW.active_role, 'owner')]
      ),
      2  -- High priority for new signups
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on users table
DROP TRIGGER IF EXISTS trigger_queue_user_mailchimp_sync ON users;
CREATE TRIGGER trigger_queue_user_mailchimp_sync
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION queue_user_mailchimp_sync();

-- =====================================================
-- 6. Service Area Notifications Table
-- For "Notify Me When Available" feature (replacing waitlist dependency)
-- =====================================================
CREATE TABLE IF NOT EXISTS service_area_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  phone text,
  zip_code text NOT NULL,
  source text DEFAULT 'area_notification',
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  notified boolean DEFAULT false,
  notified_at timestamptz,
  mailchimp_synced boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email, zip_code)
);

CREATE INDEX IF NOT EXISTS idx_service_area_notifications_zip ON service_area_notifications(zip_code);
CREATE INDEX IF NOT EXISTS idx_service_area_notifications_email ON service_area_notifications(email);

-- =====================================================
-- 7. Row Level Security
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE mailchimp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailchimp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailchimp_sync_queue ENABLE ROW LEVEL SECURITY;
-- Note: platform_settings RLS already enabled in migration 016
ALTER TABLE service_area_notifications ENABLE ROW LEVEL SECURITY;

-- Mailchimp tables: Service role only (edge functions)
CREATE POLICY "Service role only for mailchimp_contacts"
  ON mailchimp_contacts
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only for mailchimp_events"
  ON mailchimp_events
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only for mailchimp_sync_queue"
  ON mailchimp_sync_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- Platform settings policies already exist from migration 016
-- (uses "Allow all operations on platform_settings" policy)

-- Service area notifications: Anyone can insert (public form), service role can manage
CREATE POLICY "Anyone can create service_area_notifications"
  ON service_area_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role manages service_area_notifications"
  ON service_area_notifications
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 8. Updated_at trigger for new tables
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_mailchimp_contacts ON mailchimp_contacts;
CREATE TRIGGER set_updated_at_mailchimp_contacts
  BEFORE UPDATE ON mailchimp_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: platform_settings updated_at trigger already exists from migration 016

DROP TRIGGER IF EXISTS set_updated_at_service_area_notifications ON service_area_notifications;
CREATE TRIGGER set_updated_at_service_area_notifications
  BEFORE UPDATE ON service_area_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Done: Mailchimp Integration Migration
-- =====================================================
