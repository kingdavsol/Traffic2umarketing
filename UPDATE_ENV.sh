#!/bin/bash

################################################################################
# UPDATE .env FILE FOR QUICKSELL
# Usage: sudo bash UPDATE_ENV.sh
################################################################################

set -e

APP_DIR="/var/www/quicksell.monster"
ENV_FILE="$APP_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}UPDATE .env FILE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}✗ .env file not found at $ENV_FILE${NC}"
  exit 1
fi

echo "Current .env file location: $ENV_FILE"
echo ""

# Function to update a variable
update_env_var() {
  local key=$1
  local prompt=$2
  local current_value=$(grep "^${key}=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '"')

  echo -e "${YELLOW}${key}${NC}"
  echo "  Current: $current_value"
  read -p "  New value (press Enter to skip): " new_value

  if [ -n "$new_value" ]; then
    # Escape special characters for sed
    new_value=$(printf '%s\n' "$new_value" | sed -e 's/[\/&]/\\&/g')
    sed -i "s|^${key}=.*|${key}=\"${new_value}\"|" "$ENV_FILE"
    echo -e "  ${GREEN}✓ Updated${NC}"
  else
    echo "  ${YELLOW}⊘ Skipped${NC}"
  fi
  echo ""
}

# Update variables
echo -e "${YELLOW}Enter new values for each variable (press Enter to skip):${NC}"
echo ""

update_env_var "RESEND_API_KEY" "Resend API Key"
update_env_var "OPENAI_API_KEY" "OpenAI API Key"
update_env_var "STRIPE_SECRET_KEY" "Stripe Secret Key"
update_env_var "STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key"
update_env_var "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret"
update_env_var "STRIPE_BASIC_PRICE_ID" "Stripe Basic Price ID"
update_env_var "STRIPE_BUILDER_PRICE_ID" "Stripe Builder Price ID"
update_env_var "STRIPE_PREMIUM_PRICE_ID" "Stripe Premium Price ID"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ .env file updated${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

# Show updated values
echo "Updated values:"
grep -E "RESEND_API_KEY|OPENAI_API_KEY|STRIPE" "$ENV_FILE" | sed 's/=.*/=***/' | sed 's/^/  /'
echo ""

# Offer to restart
read -p "Restart application? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Restarting application...${NC}"
  pm2 restart quicksell
  sleep 2
  echo -e "${GREEN}✓ Application restarted${NC}"
  pm2 logs quicksell --lines 10
fi
