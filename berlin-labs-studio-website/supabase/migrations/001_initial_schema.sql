-- BERLINLABS.DIGITAL - Leads Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Unified leads table for contact and onboarding forms

-- Create the unified leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_type TEXT NOT NULL CHECK (lead_type IN ('contact', 'onboarding')),

  -- Common fields
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_type ON leads(lead_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Service role policy (for serverless functions)
DROP POLICY IF EXISTS "Service role can manage all leads" ON leads;
CREATE POLICY "Service role can manage all leads"
  ON leads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated admin policy (for future dashboard)
DROP POLICY IF EXISTS "Authenticated admins can read leads" ON leads;
CREATE POLICY "Authenticated admins can read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Add comment for documentation
COMMENT ON TABLE leads IS 'Unified leads table for berlinlabs.digital - stores both contact and onboarding submissions';
COMMENT ON COLUMN leads.lead_type IS 'Discriminator: "contact" for general inquiries, "onboarding" for MenuFlows pilot applications';
COMMENT ON COLUMN leads.status IS 'Lead workflow status: new → contacted → qualified → converted → archived';
