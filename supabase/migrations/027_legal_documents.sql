-- =====================================================
-- 027: Legal Documents
-- =====================================================
-- Adds tables for TOS acceptance tracking and e-signatures

-- =====================================================
-- 1. Legal Documents Table
-- Stores document templates and versions
-- =====================================================
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type text NOT NULL CHECK (document_type IN ('tos', 'privacy_policy', 'liability_waiver', 'service_agreement', 'operator_agreement', 'contractor_agreement')),
  version text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  summary text,
  is_active boolean DEFAULT false,
  requires_signature boolean DEFAULT false,
  effective_at timestamptz DEFAULT now(),
  supersedes_id uuid REFERENCES legal_documents(id) ON DELETE SET NULL,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(document_type, version)
);

CREATE INDEX IF NOT EXISTS idx_legal_documents_type ON legal_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_legal_documents_active ON legal_documents(is_active, document_type);

-- =====================================================
-- 2. Document Acceptances Table
-- Records user acceptance of legal documents
-- =====================================================
CREATE TABLE IF NOT EXISTS document_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
  accepted_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  signature_data text,
  signature_typed text,
  accepted_during text CHECK (accepted_during IN ('signup', 'login', 'checkout', 'service_request', 'settings', 'prompt')),
  metadata jsonb DEFAULT '{}',
  UNIQUE(user_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_document_acceptances_user ON document_acceptances(user_id);
CREATE INDEX IF NOT EXISTS idx_document_acceptances_document ON document_acceptances(document_id);

-- =====================================================
-- 3. Helper Functions
-- =====================================================

-- Get the currently active version of a document type
CREATE OR REPLACE FUNCTION get_active_legal_document(doc_type text)
RETURNS legal_documents AS $$
  SELECT *
  FROM legal_documents
  WHERE document_type = doc_type
    AND is_active = true
  ORDER BY effective_at DESC
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Check if a user has accepted the current version of a document
CREATE OR REPLACE FUNCTION has_accepted_current_document(check_user_id TEXT, doc_type text)
RETURNS boolean AS $$
DECLARE
  active_doc_id uuid;
BEGIN
  -- Get the active document ID
  SELECT id INTO active_doc_id
  FROM legal_documents
  WHERE document_type = doc_type
    AND is_active = true
  ORDER BY effective_at DESC
  LIMIT 1;

  -- If no active document, return true (nothing to accept)
  IF active_doc_id IS NULL THEN
    RETURN true;
  END IF;

  -- Check if user has accepted this document
  RETURN EXISTS (
    SELECT 1
    FROM document_acceptances
    WHERE user_id = check_user_id
      AND document_id = active_doc_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Get user's acceptance status for all document types
CREATE OR REPLACE FUNCTION get_user_acceptance_status(check_user_id TEXT)
RETURNS TABLE (
  document_type text,
  has_accepted boolean,
  accepted_at timestamptz,
  document_version text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ld.document_type,
    da.id IS NOT NULL as has_accepted,
    da.accepted_at,
    ld.version as document_version
  FROM legal_documents ld
  LEFT JOIN document_acceptances da ON ld.id = da.document_id AND da.user_id = check_user_id
  WHERE ld.is_active = true
  ORDER BY ld.document_type;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 4. Insert Default Documents
-- =====================================================
INSERT INTO legal_documents (document_type, version, title, content, summary, is_active, requires_signature, effective_at) VALUES
(
  'tos',
  '1.0',
  'Terms of Service',
  E'# Terms of Service\n\n## 1. Acceptance of Terms\nBy accessing or using the 360 Method application ("Service"), you agree to be bound by these Terms of Service.\n\n## 2. Description of Service\nThe Service provides home maintenance tracking, inspection tools, and connection to professional service providers.\n\n## 3. User Accounts\nYou are responsible for maintaining the security of your account and all activities under your account.\n\n## 4. Privacy\nYour use of the Service is also governed by our Privacy Policy.\n\n## 5. Limitation of Liability\nThe Service is provided "as is" without warranties of any kind.\n\n## 6. Changes to Terms\nWe reserve the right to modify these terms at any time.\n\nLast updated: January 2025',
  'By using 360 Method, you agree to our terms of service including account responsibilities and service limitations.',
  true,
  false,
  now()
),
(
  'privacy_policy',
  '1.0',
  'Privacy Policy',
  E'# Privacy Policy\n\n## Information We Collect\nWe collect information you provide when creating an account, adding properties, and using our services.\n\n## How We Use Your Information\n- To provide and improve our services\n- To communicate with you about your account\n- To send relevant notifications and updates\n\n## Data Security\nWe implement appropriate security measures to protect your personal information.\n\n## Your Rights\nYou may request access to, correction of, or deletion of your personal data.\n\n## Contact Us\nFor privacy inquiries, contact privacy@360method.com\n\nLast updated: January 2025',
  'We collect account and property information to provide our services. You have rights to your data.',
  true,
  false,
  now()
),
(
  'service_agreement',
  '1.0',
  'HomeCare Service Agreement',
  E'# HomeCare Service Agreement\n\n## Service Description\nHomeCare provides scheduled property inspections, preventive maintenance, and emergency support.\n\n## Service Tiers\n- Essential: 4 visits/year, 6 hours included labor\n- Premium: 4 visits/year, 10 hours included labor\n- Elite: 4 visits/year, 16 hours included labor\n\n## Scheduling\nVisits are scheduled at mutually convenient times with 48-hour advance notice.\n\n## Payment Terms\nMonthly subscription billed in advance. Additional services billed separately.\n\n## Cancellation\nCancel anytime with 30 days notice.\n\n## Liability\nOperators carry appropriate insurance. Property owner responsible for pre-existing conditions.\n\nLast updated: January 2025',
  'HomeCare service includes scheduled visits, labor hours, and emergency support based on your tier.',
  true,
  true,
  now()
),
(
  'liability_waiver',
  '1.0',
  'Liability Waiver',
  E'# Liability Waiver and Release\n\nI understand that property maintenance and inspection services involve inherent risks.\n\nI hereby release 360 Method and its service operators from liability for:\n- Normal wear and tear discovered during inspections\n- Pre-existing conditions\n- Issues beyond the scope of services\n\nI acknowledge that:\n- Final decisions on repairs are my responsibility\n- Recommendations are advisory in nature\n- Emergency services have response time limitations\n\nBy signing below, I confirm I have read and understand this waiver.\n\nLast updated: January 2025',
  'Release of liability for inherent risks, pre-existing conditions, and advisory limitations.',
  true,
  true,
  now()
)
ON CONFLICT (document_type, version) DO NOTHING;

-- =====================================================
-- 5. Row Level Security
-- =====================================================

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_acceptances ENABLE ROW LEVEL SECURITY;

-- Legal documents: Public read, admin write
CREATE POLICY "Anyone can read active legal_documents"
  ON legal_documents
  FOR SELECT
  USING (is_active = true OR auth.role() = 'service_role');

CREATE POLICY "Service role manages legal_documents"
  ON legal_documents
  FOR ALL
  USING (auth.role() = 'service_role');

-- Document acceptances: Users can read/create their own
CREATE POLICY "Users can view own acceptances"
  ON document_acceptances
  FOR SELECT
  USING (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

CREATE POLICY "Users can create own acceptances"
  ON document_acceptances
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role manages acceptances"
  ON document_acceptances
  FOR ALL
  USING (auth.role() = 'service_role');

-- =====================================================
-- 6. Updated_at trigger
-- =====================================================
DROP TRIGGER IF EXISTS set_updated_at_legal_documents ON legal_documents;
CREATE TRIGGER set_updated_at_legal_documents
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Done: Legal Documents Migration
-- =====================================================
