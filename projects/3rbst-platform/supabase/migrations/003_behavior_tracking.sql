-- Create behavior_events table for advanced user behavior tracking and persona analysis
CREATE TABLE IF NOT EXISTS behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  event_type TEXT NOT NULL,
  context JSONB, -- Flexible JSON storage for event-specific data
  session_id TEXT,
  user_agent TEXT DEFAULT 'whatsapp',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient behavior analysis queries
CREATE INDEX IF NOT EXISTS idx_behavior_events_user_id ON behavior_events(user_id);
CREATE INDEX IF NOT EXISTS idx_behavior_events_phone_number ON behavior_events(phone_number);
CREATE INDEX IF NOT EXISTS idx_behavior_events_event_type ON behavior_events(event_type);
CREATE INDEX IF NOT EXISTS idx_behavior_events_created_at ON behavior_events(created_at);
CREATE INDEX IF NOT EXISTS idx_behavior_events_session_id ON behavior_events(session_id);

-- Create GIN index for JSON context queries
CREATE INDEX IF NOT EXISTS idx_behavior_events_context ON behavior_events USING GIN (context);

-- Add behavior tracking columns to existing usage_logs for enhanced analysis
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS document_category TEXT;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS image_size_mb DECIMAL(10,2);
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS queue_wait_time_ms INTEGER;
ALTER TABLE usage_logs ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create indexes for the new usage_logs columns
CREATE INDEX IF NOT EXISTS idx_usage_logs_document_category ON usage_logs(document_category);
CREATE INDEX IF NOT EXISTS idx_usage_logs_session_id ON usage_logs(session_id);

-- Enable RLS on behavior_events
ALTER TABLE behavior_events ENABLE ROW LEVEL SECURITY;

-- Create policy for behavior_events
CREATE POLICY "Behavior events can be managed by service role" ON behavior_events FOR ALL USING (true);

-- Create materialized view for persona analysis performance
CREATE MATERIALIZED VIEW IF NOT EXISTS user_persona_metrics AS
SELECT 
  u.id,
  u.phone_number,
  u.created_at as user_created_at,
  u.last_active_at,
  u.subscription_tier,
  u.total_credits,
  u.free_documents_used,
  u.paid_documents_used,
  
  -- Usage metrics
  COUNT(ul.id) as total_documents_analyzed,
  COUNT(CASE WHEN ul.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as documents_last_30_days,
  COUNT(CASE WHEN ul.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as documents_last_7_days,
  AVG(ul.processing_time_ms) as avg_processing_time_ms,
  
  -- Document categories
  COUNT(CASE WHEN ul.document_category = 'tax' THEN 1 END) as tax_documents,
  COUNT(CASE WHEN ul.document_category = 'legal' THEN 1 END) as legal_documents,
  COUNT(CASE WHEN ul.document_category = 'medical' THEN 1 END) as medical_documents,
  COUNT(CASE WHEN ul.document_category = 'business' THEN 1 END) as business_documents,
  
  -- Payment behavior
  COUNT(pt.id) as total_payments,
  COALESCE(SUM(pt.amount), 0) as total_spent,
  MAX(pt.created_at) as last_payment_date,
  
  -- Behavioral events
  COUNT(be.id) as total_behavior_events,
  COUNT(CASE WHEN be.event_type = 'payment_inquiry' THEN 1 END) as payment_inquiries,
  COUNT(CASE WHEN be.event_type = 'error_encountered' THEN 1 END) as error_events,
  
  -- Engagement metrics
  EXTRACT(days FROM (NOW() - u.last_active_at)) as days_since_last_active,
  EXTRACT(days FROM (NOW() - u.created_at)) as user_age_days,
  
  -- Specialization metrics
  CASE 
    WHEN COUNT(ul.id) = 0 THEN 'unknown'
    ELSE (
      SELECT ul2.document_category 
      FROM usage_logs ul2 
      WHERE ul2.user_id = u.id 
      GROUP BY ul2.document_category 
      ORDER BY COUNT(*) DESC 
      LIMIT 1
    )
  END as dominant_document_category

FROM users u
LEFT JOIN usage_logs ul ON u.id = ul.user_id
LEFT JOIN payment_transactions pt ON u.phone_number = pt.phone_number AND pt.status = 'completed'
LEFT JOIN behavior_events be ON u.id = be.user_id
GROUP BY u.id, u.phone_number, u.created_at, u.last_active_at, u.subscription_tier, u.total_credits, u.free_documents_used, u.paid_documents_used;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_persona_metrics_user_id ON user_persona_metrics(id);
CREATE INDEX IF NOT EXISTS idx_user_persona_metrics_phone ON user_persona_metrics(phone_number);
CREATE INDEX IF NOT EXISTS idx_user_persona_metrics_tier ON user_persona_metrics(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_persona_metrics_activity ON user_persona_metrics(days_since_last_active);

-- Create function to refresh persona metrics
CREATE OR REPLACE FUNCTION refresh_persona_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_persona_metrics;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically categorize documents based on analysis content
CREATE OR REPLACE FUNCTION categorize_document_analysis()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-categorize based on analysis result content
    IF NEW.analysis_result IS NOT NULL THEN
        NEW.document_category := (
            CASE 
                WHEN LOWER(NEW.analysis_result) ~ '(finanzamt|steuer|tax|abrechnung)' THEN 'tax'
                WHEN LOWER(NEW.analysis_result) ~ '(gericht|polizei|rechtsanwalt|legal|court)' THEN 'legal'
                WHEN LOWER(NEW.analysis_result) ~ '(krankenkasse|arzt|medical|health|insurance)' THEN 'medical'
                WHEN LOWER(NEW.analysis_result) ~ '(amt|behörde|government|official)' THEN 'government'
                WHEN LOWER(NEW.analysis_result) ~ '(rechnung|mahnung|invoice|business)' THEN 'business'
                WHEN LOWER(NEW.analysis_result) ~ '(brief|letter|personal|private)' THEN 'personal'
                ELSE 'general'
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic document categorization
DROP TRIGGER IF EXISTS trigger_categorize_document ON usage_logs;
CREATE TRIGGER trigger_categorize_document
    BEFORE INSERT OR UPDATE ON usage_logs
    FOR EACH ROW
    EXECUTE FUNCTION categorize_document_analysis();

-- Add comments for documentation
COMMENT ON TABLE behavior_events IS 'Detailed user behavior tracking for persona analysis';
COMMENT ON COLUMN behavior_events.event_type IS 'Type of behavior event (message_received, document_analyzed, etc.)';
COMMENT ON COLUMN behavior_events.context IS 'JSON context data specific to each event type';
COMMENT ON COLUMN behavior_events.session_id IS 'Session identifier for grouping related events';

COMMENT ON MATERIALIZED VIEW user_persona_metrics IS 'Pre-calculated metrics for fast persona analysis';
COMMENT ON FUNCTION refresh_persona_metrics() IS 'Refreshes the persona metrics materialized view';
COMMENT ON FUNCTION categorize_document_analysis() IS 'Auto-categorizes documents based on analysis content';