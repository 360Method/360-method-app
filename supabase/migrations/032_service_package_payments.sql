-- Migration 032: Add payment tracking to service_packages
-- Supports Stripe checkout flow for service package payments

-- Add payment-related columns to service_packages
ALTER TABLE service_packages
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

-- Update status check to include pending_payment
ALTER TABLE service_packages
DROP CONSTRAINT IF EXISTS service_packages_status_check;

ALTER TABLE service_packages
ADD CONSTRAINT service_packages_status_check
CHECK (status IN ('submitted', 'pending_payment', 'reviewing', 'quoted', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled'));

-- Create index for payment lookups
CREATE INDEX IF NOT EXISTS idx_service_packages_checkout_session
ON service_packages(stripe_checkout_session_id)
WHERE stripe_checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_service_packages_payment_intent
ON service_packages(stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;

-- Add comment explaining the columns
COMMENT ON COLUMN service_packages.stripe_checkout_session_id IS 'Stripe Checkout Session ID for tracking payment';
COMMENT ON COLUMN service_packages.stripe_payment_intent_id IS 'Stripe Payment Intent ID after successful payment';
COMMENT ON COLUMN service_packages.payment_status IS 'Payment status: unpaid, pending, paid, failed, refunded';
