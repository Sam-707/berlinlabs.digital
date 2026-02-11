-- Create users table for tracking WhatsApp users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  free_documents_used INTEGER DEFAULT 0,
  paid_documents_used INTEGER DEFAULT 0,
  total_credits INTEGER DEFAULT 1, -- 1 free document to start
  subscription_tier TEXT DEFAULT 'free', -- free, basic, premium, unlimited
  subscription_updated TIMESTAMP WITH TIME ZONE,
  subscription_expires TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table for tracking each document analysis
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  message_sid TEXT,
  document_type TEXT,
  analysis_result TEXT,
  was_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processing_time_ms INTEGER
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (very permissive for now, service role will handle access)
CREATE POLICY "Users can be managed by service role" ON users FOR ALL USING (true);
CREATE POLICY "Usage logs can be managed by service role" ON usage_logs FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create payment_transactions table for tracking payments
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  plan_id TEXT NOT NULL, -- basic, premium, unlimited
  tier TEXT NOT NULL, -- basic, premium, unlimited
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  paypal_order_id TEXT UNIQUE NOT NULL,
  paypal_transaction_id TEXT,
  payer_email TEXT,
  payer_name TEXT,
  documents_purchased INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_phone ON payment_transactions(phone_number);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Enable RLS on payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payment transactions can be managed by service role" ON payment_transactions FOR ALL USING (true);