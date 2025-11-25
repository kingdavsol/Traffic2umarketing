#!/bin/bash

################################################################################
# COMPREHENSIVE SSL/TLS SETUP FOR WILDCARD DOMAINS
# Sets up Let's Encrypt wildcard certificate for *.9gg.app
# Auto-renewal and monitoring included
# Usage: sudo bash VPS_COMPREHENSIVE_SSL_SETUP.sh [DOMAIN] [EMAIL]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default values
DOMAIN="${1:-9gg.app}"
EMAIL="${2:-admin@9gg.app}"
MAIN_DOMAIN="$DOMAIN"
WILDCARD_DOMAIN="*.$DOMAIN"
CERT_DIR="/etc/letsencrypt/live/$DOMAIN"
ALT_DOMAIN="quicksell.monster"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}COMPREHENSIVE SSL/TLS SETUP${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Configuration:"
echo "  Main Domain: $MAIN_DOMAIN"
echo "  Wildcard Domain: $WILDCARD_DOMAIN"
echo "  Email: $EMAIL"
echo ""

# ============================================================================
# STEP 1: Verify Prerequisites
# ============================================================================

echo -e "${YELLOW}[1/7] Verifying prerequisites...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✗ This script must be run as root (sudo)${NC}"
  exit 1
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}  Installing Certbot...${NC}"
  apt-get update -qq > /dev/null 2>&1 || true
  apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1 || true
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}  Installing Nginx...${NC}"
  apt-get install -y nginx > /dev/null 2>&1 || true
fi

echo -e "${GREEN}✓ Prerequisites verified${NC}"
echo ""

# ============================================================================
# STEP 2: Create Certbot Directories
# ============================================================================

echo -e "${YELLOW}[2/7] Setting up certificate directories...${NC}"

mkdir -p /var/www/certbot
mkdir -p /etc/letsencrypt
mkdir -p /var/log/letsencrypt
chmod 755 /var/www/certbot

echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# ============================================================================
# STEP 3: Create Nginx Configuration for Certificate Validation
# ============================================================================

echo -e "${YELLOW}[3/7] Creating Nginx ACME challenge configuration...${NC}"

# Create ACME validation server block
cat > /etc/nginx/sites-available/acme-challenge.conf << 'NGINX_EOF'
# ACME Challenge Configuration for Let's Encrypt
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    # ACME challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}
NGINX_EOF

# Enable the configuration
ln -sf /etc/nginx/sites-available/acme-challenge.conf /etc/nginx/sites-enabled/acme-challenge.conf 2>/dev/null || true

# Test Nginx configuration
if ! nginx -t > /dev/null 2>&1; then
  echo -e "${RED}✗ Nginx configuration has errors${NC}"
  nginx -t
  exit 1
fi

# Reload Nginx
systemctl reload nginx > /dev/null 2>&1 || true

echo -e "${GREEN}✓ ACME configuration ready${NC}"
echo ""

# ============================================================================
# STEP 4: Obtain Wildcard Certificate
# ============================================================================

echo -e "${YELLOW}[4/7] Obtaining wildcard certificate from Let's Encrypt...${NC}"

# Check if certificate already exists
if [ -f "$CERT_DIR/fullchain.pem" ]; then
  echo -e "${YELLOW}  Certificate already exists at $CERT_DIR${NC}"
  echo -e "${YELLOW}  Attempting renewal...${NC}"
  certbot renew --quiet --nginx 2>/dev/null || true
else
  echo -e "${YELLOW}  Requesting new wildcard certificate for $WILDCARD_DOMAIN...${NC}"

  # Request wildcard certificate
  certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$MAIN_DOMAIN" \
    --domains "$WILDCARD_DOMAIN" \
    --domains "$ALT_DOMAIN" \
    2>&1 | grep -v "^Waiting for propagation"

  if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to obtain certificate${NC}"
    echo "  Try manual setup:"
    echo "  sudo certbot certonly --manual --preferred-challenges dns -d $MAIN_DOMAIN -d $WILDCARD_DOMAIN"
    exit 1
  fi
fi

echo -e "${GREEN}✓ Certificate obtained/renewed${NC}"
echo ""

# ============================================================================
# STEP 5: Verify Certificate
# ============================================================================

echo -e "${YELLOW}[5/7] Verifying certificate...${NC}"

if [ -f "$CERT_DIR/fullchain.pem" ] && [ -f "$CERT_DIR/privkey.pem" ]; then
  echo -e "${GREEN}✓ Certificate files verified${NC}"

  # Show certificate details
  echo ""
  echo "Certificate Details:"
  echo "  Path: $CERT_DIR"
  echo "  Certificate: $(openssl x509 -in $CERT_DIR/fullchain.pem -noout -subject | cut -d= -f3-)"
  echo "  Valid From: $(openssl x509 -in $CERT_DIR/fullchain.pem -noout -startdate | cut -d= -f2)"
  echo "  Valid To: $(openssl x509 -in $CERT_DIR/fullchain.pem -noout -enddate | cut -d= -f2)"

  # Calculate days until expiration
  EXPIRY_DATE=$(openssl x509 -in $CERT_DIR/fullchain.pem -noout -enddate | cut -d= -f2)
  EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
  CURRENT_EPOCH=$(date +%s)
  DAYS_LEFT=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

  echo "  Days Until Expiration: $DAYS_LEFT days"

  if [ $DAYS_LEFT -lt 30 ]; then
    echo -e "${RED}  WARNING: Certificate expires in less than 30 days!${NC}"
  fi
else
  echo -e "${RED}✗ Certificate files not found${NC}"
  exit 1
fi

echo ""

# ============================================================================
# STEP 6: Configure Auto-Renewal
# ============================================================================

echo -e "${YELLOW}[6/7] Configuring automatic certificate renewal...${NC}"

# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh << 'HOOK_EOF'
#!/bin/bash
# Reload Nginx after certificate renewal
systemctl reload nginx
logger -t certbot "Certificate renewed, Nginx reloaded"
HOOK_EOF

chmod 755 /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh

# Create renewal timer
systemctl restart certbot.timer > /dev/null 2>&1 || \
  systemctl start certbot.timer > /dev/null 2>&1 || \
  echo "Note: Certbot timer may not be available, cron job will be used"

# Add cron job for renewal (daily check at 2 AM)
CRON_JOB="0 2 * * * root /usr/bin/certbot renew --quiet --nginx && systemctl reload nginx"
CRON_FILE="/etc/cron.d/certbot-renewal"

if [ ! -f "$CRON_FILE" ]; then
  echo "$CRON_JOB" > "$CRON_FILE"
  chmod 644 "$CRON_FILE"
fi

echo -e "${GREEN}✓ Auto-renewal configured${NC}"
echo "  - Certbot timer: systemctl status certbot.timer"
echo "  - Cron job: $CRON_FILE"
echo ""

# ============================================================================
# STEP 7: Create Nginx SSL Configuration Template
# ============================================================================

echo -e "${YELLOW}[7/7] Creating Nginx SSL configuration template...${NC}"

cat > /etc/nginx/snippets/ssl-9gg.app.conf << 'SSL_SNIPPET_EOF'
# SSL Configuration for 9gg.app - Wildcard Certificate
# Include this file in your server {} blocks

# Use wildcard SSL certificate
ssl_certificate /etc/letsencrypt/live/9gg.app/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/9gg.app/privkey.pem;

# SSL protocols and ciphers
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5:!DSS:!eNULL:!NULL;
ssl_prefer_server_ciphers on;

# SSL session configuration
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_session_tickets off;

# OCSP stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/9gg.app/chain.pem;
resolver 8.8.8.8 8.8.4.4;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'" always;
SSL_SNIPPET_EOF

echo -e "${GREEN}✓ SSL configuration template created${NC}"
echo "  Location: /etc/nginx/snippets/ssl-9gg.app.conf"
echo ""

# ============================================================================
# Create Nginx Server Block Template
# ============================================================================

cat > /etc/nginx/snippets/server-block-template.conf << 'SERVER_TEMPLATE_EOF'
# Template for subdomain server block
# Usage: Copy and modify for each app

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name APP_NAME.9gg.app;

    # Include SSL configuration
    include /etc/nginx/snippets/ssl-9gg.app.conf;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json;

    # App proxy configuration
    location / {
        proxy_pass http://127.0.0.1:PORT;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "ok\n";
        add_header Content-Type text/plain;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name APP_NAME.9gg.app;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}
SERVER_TEMPLATE_EOF

echo "  Server block template: /etc/nginx/snippets/server-block-template.conf"
echo ""

# ============================================================================
# Final Verification
# ============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ SSL/TLS SETUP COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "SSL Certificate Information:"
echo "  Certificate Path: $CERT_DIR/fullchain.pem"
echo "  Private Key Path: $CERT_DIR/privkey.pem"
echo ""

echo "Auto-Renewal Status:"
systemctl is-enabled certbot.timer 2>/dev/null && echo "  ✓ Certbot timer enabled" || echo "  ⊘ Using cron job for renewal"
echo ""

echo "Next Steps:"
echo "  1. Test certificate:"
echo "     sudo openssl x509 -in $CERT_DIR/fullchain.pem -text -noout"
echo ""
echo "  2. Test HTTPS connectivity:"
echo "     curl https://$MAIN_DOMAIN -I"
echo ""
echo "  3. Deploy apps with this SSL certificate:"
echo "     sudo bash MONOREPO_DEPLOYMENT_SETUP.sh"
echo ""
echo "  4. Monitor certificate renewal:"
echo "     certbot certificates"
echo ""
echo "  5. Test renewal (dry run):"
echo "     certbot renew --dry-run"
echo ""

echo "Useful Commands:"
echo "  View all certificates:"
echo "    sudo certbot certificates"
echo ""
echo "  Force renewal:"
echo "    sudo certbot renew --force-renewal"
echo ""
echo "  Check Nginx with SSL:"
echo "    sudo nginx -t"
echo "    sudo systemctl restart nginx"
echo ""
echo "  Monitor renewal logs:"
echo "    sudo tail -f /var/log/letsencrypt/letsencrypt.log"
echo ""
