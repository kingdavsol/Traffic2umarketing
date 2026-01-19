-- Add Stripe fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS listings_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS free_listings_remaining INTEGER DEFAULT 3;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  amount_due INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  invoice_url VARCHAR(500),
  invoice_pdf VARCHAR(500),
  hosted_invoice_url VARCHAR(500),
  due_date TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE,
  type VARCHAR(50) NOT NULL DEFAULT 'card',
  brand VARCHAR(50),
  last4 VARCHAR(4),
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Create subscription_events table for webhook event tracking
CREATE TABLE IF NOT EXISTS subscription_events (
  id SERIAL PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id),
  subscription_id INTEGER REFERENCES subscriptions(id),
  data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_id ON subscription_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);

-- Pricing plans configuration table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_monthly INTEGER NOT NULL,
  stripe_price_id VARCHAR(255),
  features JSONB,
  listing_limit INTEGER,
  marketplace_limit INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default pricing plans
INSERT INTO pricing_plans (id, name, description, price_monthly, listing_limit, marketplace_limit, features)
VALUES
  ('free', 'Free', 'Try QuickSell with 3 free listings', 0, 3, 1,
   '["3 free listings total", "AI-powered descriptions", "Post to eBay marketplace", "Basic price estimation", "Community support"]'),
  ('premium', 'Premium', 'Perfect for regular sellers', 499, NULL, 10,
   '["Unlimited listings", "AI-powered descriptions", "Post to 10+ marketplaces", "Advanced price estimation", "Priority email support", "Sales analytics", "Bulk upload (up to 100 items)", "No ads"]'),
  ('premium_plus', 'Premium Plus', 'For power sellers', 999, NULL, NULL,
   '["Everything in Premium", "AI image classification", "Inventory management", "Shipping cost optimization", "Advanced seller insights", "Priority support", "Early access to new features"]')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  listing_limit = EXCLUDED.listing_limit,
  marketplace_limit = EXCLUDED.marketplace_limit,
  features = EXCLUDED.features;
