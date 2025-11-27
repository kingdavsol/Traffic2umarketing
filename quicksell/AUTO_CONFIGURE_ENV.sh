#!/bin/bash

################################################################################
# QuickSell .env Auto-Configuration Script
# Generates secure passwords and configures .env automatically
################################################################################

set -e

ENV_FILE="/var/www/quicksell.monster/.env"
ENV_EXAMPLE="/var/www/quicksell.monster/.env.example"

echo "🔧 Auto-configuring QuickSell environment..."

# Check if .env.example exists
if [ ! -f "$ENV_EXAMPLE" ]; then
  echo "❌ Error: .env.example not found at $ENV_EXAMPLE"
  exit 1
fi

# Copy .env.example to .env
cp "$ENV_EXAMPLE" "$ENV_FILE"

# Generate secure random passwords
generate_password() {
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

DB_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_password)$(generate_password) # 64 chars for extra security

echo "✅ Generated secure passwords"

# Update .env file with generated values
sed -i "s|DB_PASSWORD=password|DB_PASSWORD=$DB_PASSWORD|g" "$ENV_FILE"
sed -i "s|REDIS_PASSWORD=|REDIS_PASSWORD=$REDIS_PASSWORD|g" "$ENV_FILE"
sed -i "s|JWT_SECRET=your-super-secret-jwt-key-change-in-production|JWT_SECRET=$JWT_SECRET|g" "$ENV_FILE"

# Set Node environment to production
sed -i "s|NODE_ENV=development|NODE_ENV=production|g" "$ENV_FILE"

# Set production URLs (update with your actual domain)
HOSTNAME=$(hostname -I | awk '{print $1}')
sed -i "s|FRONTEND_URL=http://localhost:3000|FRONTEND_URL=http://$HOSTNAME|g" "$ENV_FILE"
sed -i "s|API_BASE_URL=http://localhost:5000|API_BASE_URL=http://$HOSTNAME:5000|g" "$ENV_FILE"
sed -i "s|NEXT_PUBLIC_APP_URL=http://localhost:3000|NEXT_PUBLIC_APP_URL=http://$HOSTNAME|g" "$ENV_FILE"

# Set CORS origins
sed -i "s|CORS_ORIGINS=http://localhost:3000,http://localhost:8081,http://localhost:19006|CORS_ORIGINS=http://$HOSTNAME,https://$HOSTNAME,http://quicksell.monster,https://quicksell.monster|g" "$ENV_FILE"

echo "✅ Configured production URLs for IP: $HOSTNAME"

# Check for optional API keys
echo ""
echo "📝 Optional API Keys (press Enter to skip):"
echo ""

# OpenAI API Key
read -p "OpenAI API Key (for AI features) [sk-...]: " OPENAI_KEY
if [ -n "$OPENAI_KEY" ]; then
  sed -i "s|OPENAI_API_KEY=sk-your-openai-api-key|OPENAI_API_KEY=$OPENAI_KEY|g" "$ENV_FILE"
  echo "✅ OpenAI API key configured"
else
  echo "⚠️  OpenAI API key skipped (AI features will be disabled)"
fi

# Stripe API Key
read -p "Stripe Secret Key (for payments) [sk_test_... or sk_live_...]: " STRIPE_KEY
if [ -n "$STRIPE_KEY" ]; then
  sed -i "s|STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key|STRIPE_SECRET_KEY=$STRIPE_KEY|g" "$ENV_FILE"
  echo "✅ Stripe API key configured"
else
  echo "⚠️  Stripe API key skipped (payments will be disabled)"
fi

echo ""
echo "✅ .env configuration complete!"
echo ""
echo "📋 Generated Credentials (SAVE THESE!):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Database Password: $DB_PASSWORD"
echo "Redis Password:    $REDIS_PASSWORD"
echo "JWT Secret:        ${JWT_SECRET:0:32}... (truncated)"
echo "Server IP:         $HOSTNAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💾 Credentials saved to: $ENV_FILE"
echo ""
