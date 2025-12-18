-- =====================================================
-- 026: SMS Marketing
-- =====================================================
-- Adds tables for SMS campaigns via Twilio with proper TCPA compliance

-- =====================================================
-- 1. SMS Campaigns Table
-- Stores campaign definitions and status
-- =====================================================
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  audience_filter jsonb DEFAULT '{}',
  message_template text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  total_recipients integer DEFAULT 0,
  total_sent integer DEFAULT 0,
  total_delivered integer DEFAULT 0,
  total_failed integer DEFAULT 0,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_sms_campaigns_scheduled ON sms_campaigns(scheduled_at) WHERE status = 'scheduled';

-- =====================================================
-- 2. SMS Messages Table
-- Individual messages sent in campaigns
-- =====================================================
CREATE TABLE IF NOT EXISTS sms_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES sms_campaigns(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  recipient_id uuid,
  recipient_type text CHECK (recipient_type IN ('user', 'lead', 'notification_request', 'other')),
  message_body text NOT NULL,
  twilio_sid text,
  twilio_status text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'delivered', 'failed', 'undelivered')),
  error_code text,
  error_message text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_campaign ON sms_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sms_messages_phone ON sms_messages(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_messages_status ON sms_messages(status);
CREATE INDEX IF NOT EXISTS idx_sms_messages_twilio_sid ON sms_messages(twilio_sid);

-- =====================================================
-- 3. SMS Opt-Outs Table (TCPA Compliance)
-- Tracks users who have opted out of SMS
-- =====================================================
CREATE TABLE IF NOT EXISTS sms_opt_outs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL UNIQUE,
  opt_out_method text NOT NULL CHECK (opt_out_method IN ('keyword', 'manual', 'api', 'complaint')),
  opt_out_keyword text,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  campaign_id uuid REFERENCES sms_campaigns(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_opt_outs_phone ON sms_opt_outs(phone_number);

-- =====================================================
-- 4. SMS Templates Table
-- Reusable message templates
-- =====================================================
CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text DEFAULT 'general' CHECK (category IN ('general', 'marketing', 'transactional', 'reminder', 'alert')),
  message_template text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert some default templates
INSERT INTO sms_templates (name, category, message_template, variables) VALUES
  ('Welcome', 'general', 'Welcome to 360 Method, {{first_name}}! Track your home maintenance at 360method.com. Reply STOP to opt out.', ARRAY['first_name']),
  ('Service Available', 'marketing', 'Great news {{first_name}}! 360 Method professional service is now available in your area. Learn more: {{link}}. Reply STOP to opt out.', ARRAY['first_name', 'link']),
  ('Appointment Reminder', 'reminder', 'Reminder: Your 360 Method appointment is {{date}} at {{time}}. Questions? Reply to this message.', ARRAY['date', 'time']),
  ('Quote Ready', 'transactional', '{{first_name}}, your 360 Method quote is ready! View it here: {{link}}', ARRAY['first_name', 'link'])
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. SMS Send Queue Table
-- Queue for batch sending
-- =====================================================
CREATE TABLE IF NOT EXISTS sms_send_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES sms_campaigns(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  message_body text NOT NULL,
  recipient_id uuid,
  recipient_type text,
  priority integer DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  error_message text,
  scheduled_for timestamptz DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_queue_pending ON sms_send_queue(status, priority DESC, scheduled_for) WHERE status = 'pending';

-- =====================================================
-- 6. Function to check opt-out status
-- =====================================================
CREATE OR REPLACE FUNCTION is_phone_opted_out(phone text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM sms_opt_outs WHERE phone_number = phone
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 7. Row Level Security
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE sms_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_send_queue ENABLE ROW LEVEL SECURITY;

-- All SMS tables: Service role only (edge functions/admin)
CREATE POLICY "Service role only for sms_campaigns"
  ON sms_campaigns
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only for sms_messages"
  ON sms_messages
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only for sms_opt_outs"
  ON sms_opt_outs
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated read sms_templates"
  ON sms_templates
  FOR SELECT
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Service role write sms_templates"
  ON sms_templates
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role only for sms_send_queue"
  ON sms_send_queue
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 8. Updated_at triggers
-- =====================================================
DROP TRIGGER IF EXISTS set_updated_at_sms_campaigns ON sms_campaigns;
CREATE TRIGGER set_updated_at_sms_campaigns
  BEFORE UPDATE ON sms_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_sms_templates ON sms_templates;
CREATE TRIGGER set_updated_at_sms_templates
  BEFORE UPDATE ON sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Done: SMS Marketing Migration
-- =====================================================
