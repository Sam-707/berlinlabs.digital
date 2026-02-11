-- Add GDPR consent tracking to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_given BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gdpr_consent_ip TEXT DEFAULT 'whatsapp';

-- Create index for GDPR consent queries
CREATE INDEX IF NOT EXISTS idx_users_gdpr_consent ON users(gdpr_consent_given);

-- Update existing users to require consent (they'll be prompted on next interaction)
UPDATE users SET gdpr_consent_given = FALSE WHERE gdpr_consent_given IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.gdpr_consent_given IS 'Whether user has given GDPR consent for data processing';
COMMENT ON COLUMN users.gdpr_consent_date IS 'When GDPR consent was given or last updated';
COMMENT ON COLUMN users.gdpr_consent_ip IS 'IP address or source when consent was given (whatsapp for WhatsApp users)';