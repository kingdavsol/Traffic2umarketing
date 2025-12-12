-- Create sales table for tracking all sales (automated and manual entries)
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  listing_title VARCHAR(255) NOT NULL,
  marketplace VARCHAR(100) NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_name VARCHAR(255),
  buyer_email VARCHAR(255),
  transaction_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_listing_id ON sales(listing_id);
CREATE INDEX IF NOT EXISTS idx_sales_marketplace ON sales(marketplace);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER sales_updated_at_trigger
BEFORE UPDATE ON sales
FOR EACH ROW
EXECUTE FUNCTION update_sales_updated_at();
