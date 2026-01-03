-- Create AI analysis log table to track costly AI operations
CREATE TABLE IF NOT EXISTS ai_analysis_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  analysis_type VARCHAR(50) NOT NULL, -- 'photo_analysis', 'price_suggestion', etc.
  photos_count INTEGER DEFAULT 1,
  tokens_used INTEGER,
  cost_usd DECIMAL(10,4),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON ai_analysis_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON ai_analysis_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type ON ai_analysis_log(analysis_type);

-- Add comments
COMMENT ON TABLE ai_analysis_log IS 'Tracks AI analysis operations for cost monitoring and user analytics';
COMMENT ON COLUMN ai_analysis_log.tokens_used IS 'OpenAI tokens consumed';
COMMENT ON COLUMN ai_analysis_log.cost_usd IS 'Estimated cost in USD';
