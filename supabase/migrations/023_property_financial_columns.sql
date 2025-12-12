-- ============================================
-- Add Financial Columns to Properties Table
-- For PropertyProfileWizard functionality
-- ============================================

-- Purchase & Financing columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS closing_costs DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS down_payment_percent DECIMAL(5,2) DEFAULT 20;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS loan_term_years INTEGER DEFAULT 30;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS mortgage_balance DECIMAL(12,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_mortgage_payment DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS interest_rate DECIMAL(5,3);

-- Income column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2);

-- Expense columns
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_insurance DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_taxes DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS monthly_hoa DECIMAL(10,2) DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS estimated_maintenance DECIMAL(10,2);

-- Profile status
ALTER TABLE properties ADD COLUMN IF NOT EXISTS financial_profile_complete BOOLEAN DEFAULT false;

-- Comments for documentation
COMMENT ON COLUMN properties.closing_costs IS 'Total closing costs at purchase';
COMMENT ON COLUMN properties.down_payment_percent IS 'Down payment percentage (0-100)';
COMMENT ON COLUMN properties.loan_term_years IS 'Mortgage loan term in years';
COMMENT ON COLUMN properties.mortgage_balance IS 'Current outstanding mortgage balance';
COMMENT ON COLUMN properties.monthly_mortgage_payment IS 'Monthly mortgage payment (P&I)';
COMMENT ON COLUMN properties.interest_rate IS 'Mortgage interest rate (e.g., 6.5 for 6.5%)';
COMMENT ON COLUMN properties.monthly_rent IS 'Monthly rental income (if rental property)';
COMMENT ON COLUMN properties.monthly_insurance IS 'Monthly homeowners insurance cost';
COMMENT ON COLUMN properties.monthly_taxes IS 'Monthly property tax cost';
COMMENT ON COLUMN properties.monthly_hoa IS 'Monthly HOA fees';
COMMENT ON COLUMN properties.estimated_maintenance IS 'Estimated monthly maintenance budget';
COMMENT ON COLUMN properties.financial_profile_complete IS 'Whether the financial profile wizard has been completed';
