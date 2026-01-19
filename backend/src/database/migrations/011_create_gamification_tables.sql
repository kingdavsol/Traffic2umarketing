-- Create user_stats table for gamification
CREATE TABLE IF NOT EXISTS user_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  points INTEGER DEFAULT 0,
  badges_earned JSONB DEFAULT '[]'::jsonb,
  total_listings INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  listing_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_points ON user_stats(points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_sales ON user_stats(total_sales DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_total_revenue ON user_stats(total_revenue DESC);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  target_value INTEGER NOT NULL,
  reward_points INTEGER NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_challenges table for tracking progress
CREATE TABLE IF NOT EXISTS user_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);

-- Insert sample challenges
INSERT INTO challenges (name, description, type, target_value, reward_points, is_active)
VALUES
  ('Quick Starter', 'Create 3 listings this week', 'listings', 3, 100, true),
  ('Sales Champion', 'Make 5 sales this month', 'sales', 5, 250, true),
  ('Revenue Goal', 'Earn $100 in sales', 'revenue', 100, 200, true),
  ('Multi-Platform Pro', 'Post to 3 different marketplaces', 'marketplaces', 3, 150, true)
ON CONFLICT DO NOTHING;
