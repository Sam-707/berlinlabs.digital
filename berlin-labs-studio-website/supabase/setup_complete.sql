-- ============================================
-- BERLINLABS.DIGITAL - Supabase Database Setup
-- ============================================
-- Copy and paste this entire file into Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql/new
-- ============================================

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS leads CASCADE;

-- ============================================
-- CREATE LEADS TABLE
-- ============================================
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type TEXT NOT NULL CHECK (lead_type IN ('contact', 'onboarding')),

  -- Common fields (all leads)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,

  -- Contact-specific fields
  inquiry_type TEXT CHECK (inquiry_type IN ('Pilot Program', 'Advisory', 'Experiment Feedback', 'General Inquiry')),

  -- Onboarding-specific fields
  restaurant_name TEXT,
  phone TEXT,
  location TEXT,

  -- Metadata
  source_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'archived')),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_contacted_at TIMESTAMP WITH TIME ZONE,

  admin_notes TEXT
);

-- ============================================
-- CREATE INDEXES
-- ============================================
CREATE INDEX idx_leads_type ON leads(lead_type);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_email ON leads(email);

-- ============================================
-- CREATE UPDATED AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICIES
-- ============================================

-- Service role policy (for serverless functions)
-- This gives your Vercel functions full access to insert/update leads
DROP POLICY IF EXISTS "Service role can manage all leads" ON leads;
CREATE POLICY "Service role can manage all leads"
  ON leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated admin policy (for future dashboard)
-- When you build an admin panel, this will let authenticated admins read leads
DROP POLICY IF EXISTS "Authenticated admins can read leads" ON leads;
CREATE POLICY "Authenticated admins can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE leads IS 'Unified leads table for berlinlabs.digital - stores both contact and onboarding submissions';
COMMENT ON COLUMN leads.lead_type IS 'Discriminator: "contact" for general inquiries, "onboarding" for MenuFlows pilot applications';
COMMENT ON COLUMN leads.status IS 'Lead workflow status: new → contacted → qualified → converted → archived';
COMMENT ON COLUMN leads.inquiry_type IS 'Contact form only: Type of inquiry selected by user';
COMMENT ON COLUMN leads.restaurant_name IS 'Onboarding form only: Name of the restaurant applying for pilot';
COMMENT ON COLUMN leads.phone IS 'Onboarding form only: Optional contact phone number';
COMMENT ON COLUMN leads.location IS 'Onboarding form only: Restaurant location (Berlin district)';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after setup to verify everything is working

-- Check table exists and count rows (should be 0 initially)
SELECT COUNT(*) as total_leads FROM leads;

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'leads';

-- Verify RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'leads';

-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'leads';

-- ============================================
-- TEST DATA (OPTIONAL)
-- ============================================
-- Uncomment the lines below to insert test data

/*
INSERT INTO leads (lead_type, name, email, message, inquiry_type, status) VALUES
('contact', 'Test User', 'test@example.com', 'This is a test contact form submission', 'General Inquiry', 'new');

INSERT INTO leads (lead_type, name, restaurant_name, email, phone, location, message, status) VALUES
('onboarding', 'Restaurant Owner', 'Test Restaurant', 'owner@restaurant.com', '+49 30 12345678', 'Mitte', 'We are interested in the MenuFlows pilot program', 'new');

-- Query test data
SELECT * FROM leads ORDER BY created_at DESC;
*/

-- ============================================
-- USEFUL QUERIES FOR ADMIN DASHBOARD
-- ============================================
-- Save these for future reference when building the admin panel

-- View all new leads
-- SELECT * FROM leads WHERE status = 'new' ORDER BY created_at DESC;

-- View leads by type
-- SELECT lead_type, COUNT(*) as count FROM leads GROUP BY lead_type;

-- View recent submissions (last 7 days)
-- SELECT * FROM leads WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY created_at DESC;

-- Update lead status
-- UPDATE leads SET status = 'contacted', first_contacted_at = NOW() WHERE id = 'uuid-here';

-- Add admin notes
-- UPDATE leads SET admin_notes = 'Called venue - interested in demo' WHERE id = 'uuid-here';
