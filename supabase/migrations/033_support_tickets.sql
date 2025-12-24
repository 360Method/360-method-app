-- Migration 033: Support Tickets System
-- Enables HQ admin support ticket management

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id),
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category TEXT DEFAULT 'question' CHECK (category IN ('bug', 'question', 'billing', 'feature', 'other')),
  assigned_to TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create support_ticket_messages table for conversation threads
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support')),
  sender_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_tickets
-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admins can view all tickets (for HQ)
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Admins can update any ticket
CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Policies for support_ticket_messages
-- Users can view messages on their tickets
CREATE POLICY "Users can view own ticket messages" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = support_ticket_messages.ticket_id
      AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON support_ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Users and admins can create messages on their tickets
CREATE POLICY "Users can add messages to own tickets" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE id = support_ticket_messages.ticket_id
      AND user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Admins can add messages to any ticket" ON support_ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND (roles && ARRAY['admin', 'hq_admin'])
    )
  );

-- Add comments
COMMENT ON TABLE support_tickets IS 'Customer support tickets for HQ management';
COMMENT ON TABLE support_ticket_messages IS 'Messages/replies in support ticket threads';
