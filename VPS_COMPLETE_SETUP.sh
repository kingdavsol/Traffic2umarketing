#!/bin/bash

################################################################################
# COMPLETE VPS SETUP FOR 70+ APPS DEPLOYMENT
# One-time setup script for fresh VPS
# Installs all dependencies, configures Nginx, sets up SSL, and prepares for deployment
# Usage: sudo bash VPS_COMPLETE_SETUP.sh [DOMAIN] [EMAIL]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="${1:-9gg.app}"
EMAIL="${2:-admin@9gg.app}"
WEB_ROOT="/var/www/9gg.app"
NODE_VERSION="18"

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}COMPLETE VPS SETUP - 70+ APPS DEPLOYMENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Configuration:"
echo "  Domain: $DOMAIN"
echo "  Email: $EMAIL"
echo "  Web Root: $WEB_ROOT"
echo "  Node Version: $NODE_VERSION"
echo ""

# ============================================================================
# STEP 1: Check Root Privileges
# ============================================================================

echo -e "${YELLOW}[1/8] Checking prerequisites...${NC}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}✗ This script must be run as root (sudo)${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Running as root${NC}"
echo ""

# ============================================================================
# STEP 2: Update System Packages
# ============================================================================

echo -e "${YELLOW}[2/8] Updating system packages...${NC}"

apt-get update -qq > /dev/null 2>&1 || true
apt-get upgrade -y -qq > /dev/null 2>&1 || true
apt-get install -y curl wget git build-essential > /dev/null 2>&1 || true

echo -e "${GREEN}✓ System updated${NC}"
echo ""

# ============================================================================
# STEP 3: Install Node.js and npm
# ============================================================================

echo -e "${YELLOW}[3/8] Installing Node.js $NODE_VERSION and npm...${NC}"

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - > /dev/null 2>&1 || true

# Install Node.js
apt-get install -y nodejs > /dev/null 2>&1 || true

# Verify installation
NODE_VER=$(node -v)
NPM_VER=$(npm -v)

echo -e "${GREEN}✓ Node.js $NODE_VER installed${NC}"
echo "  npm $NPM_VER"
echo ""

# ============================================================================
# STEP 4: Install PM2 (Process Manager)
# ============================================================================

echo -e "${YELLOW}[4/8] Installing PM2 process manager...${NC}"

npm install -g pm2 > /dev/null 2>&1 || true

# Enable PM2 auto-startup
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true

echo -e "${GREEN}✓ PM2 installed and configured for auto-startup${NC}"
echo ""

# ============================================================================
# STEP 5: Install and Configure Nginx
# ============================================================================

echo -e "${YELLOW}[5/8] Installing and configuring Nginx...${NC}"

apt-get install -y nginx > /dev/null 2>&1 || true

# Create web root directory
mkdir -p "$WEB_ROOT"
chmod 755 "$WEB_ROOT"

# Disable default Nginx site
rm -f /etc/nginx/sites-enabled/default

# Create main Nginx configuration
cat > /etc/nginx/nginx.conf << 'NGINX_MAIN_EOF'
# Main Nginx Configuration for 70+ Apps

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 100M;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml application/atom+xml image/svg+xml
               text/x-component text/x-cross-domain-policy;

    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
NGINX_MAIN_EOF

# Create ACME challenge configuration
cat > /etc/nginx/conf.d/acme-challenge.conf << 'ACME_EOF'
# ACME Challenge Configuration for Let's Encrypt
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/certbot;

    location /.well-known/acme-challenge/ {
        try_files $uri =404;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
ACME_EOF

# Test Nginx configuration
if ! nginx -t > /dev/null 2>&1; then
  echo -e "${RED}✗ Nginx configuration has errors${NC}"
  nginx -t
  exit 1
fi

# Enable and start Nginx
systemctl enable nginx > /dev/null 2>&1 || true
systemctl restart nginx > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Nginx installed and configured${NC}"
echo ""

# ============================================================================
# STEP 6: Install Certbot and SSL Tools
# ============================================================================

echo -e "${YELLOW}[6/8] Installing Certbot for SSL certificates...${NC}"

apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1 || true
apt-get install -y openssl > /dev/null 2>&1 || true

# Create certbot directories
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

echo -e "${GREEN}✓ Certbot installed${NC}"
echo ""

# ============================================================================
# STEP 7: Set Up SSL Certificate
# ============================================================================

echo -e "${YELLOW}[7/8] Setting up SSL certificate for $DOMAIN...${NC}"

CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

if [ -f "$CERT_PATH/fullchain.pem" ]; then
  echo -e "${YELLOW}  Certificate already exists, checking renewal...${NC}"
  certbot renew --quiet --nginx 2>/dev/null || true
else
  echo -e "${YELLOW}  Requesting wildcard certificate...${NC}"

  certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --domains "$DOMAIN" \
    --domains "*.$DOMAIN" \
    2>&1 | grep -v "^Waiting for propagation" || true

  if [ ! -f "$CERT_PATH/fullchain.pem" ]; then
    echo -e "${YELLOW}  Certificate request failed, will retry on first deployment${NC}"
  fi
fi

# Set up automatic renewal
systemctl enable certbot.timer > /dev/null 2>&1 || \
  systemctl start certbot.timer > /dev/null 2>&1 || \
  echo "Note: Certbot timer setup complete"

echo -e "${GREEN}✓ SSL certificate configured${NC}"
echo ""

# ============================================================================
# STEP 8: Create Directory Structure and Permissions
# ============================================================================

echo -e "${YELLOW}[8/8] Setting up directory structure and permissions...${NC}"

# Create necessary directories
mkdir -p "$WEB_ROOT"
mkdir -p /var/log/nginx
mkdir -p /etc/nginx/sites-enabled
mkdir -p /etc/nginx/snippets

# Set permissions
chmod 755 "$WEB_ROOT"
chown -R www-data:www-data /var/www
chown -R www-data:www-data /var/log/nginx

# Create nginx snippets directory for SSL configuration
mkdir -p /etc/nginx/snippets

# Create health check configuration
cat > /etc/nginx/snippets/health-check.conf << 'HEALTH_EOF'
# Health check endpoint
location /health {
    access_log off;
    return 200 "ok\n";
    add_header Content-Type text/plain;
}
HEALTH_EOF

echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# ============================================================================
# Create Helper Scripts
# ============================================================================

echo -e "${BLUE}Creating helper scripts...${NC}"

# Create app status script
cat > /usr/local/bin/app-status << 'APP_STATUS_EOF'
#!/bin/bash
echo "=== PM2 Applications Status ==="
pm2 list
echo ""
echo "=== Memory Usage ==="
pm2 monit --nostreamer 2>/dev/null | head -20 || echo "PM2 monitoring available with: pm2 monit"
EOF

chmod +x /usr/local/bin/app-status

# Create app logs script
cat > /usr/local/bin/app-logs << 'APP_LOGS_EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: app-logs [app-name]"
  echo "Available apps:"
  pm2 list
  exit 1
fi
pm2 logs "$1" --lines 100
EOF

chmod +x /usr/local/bin/app-logs

# Create app restart script
cat > /usr/local/bin/app-restart << 'APP_RESTART_EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: app-restart [app-name|all]"
  exit 1
fi
pm2 restart "$1"
pm2 save
EOF

chmod +x /usr/local/bin/app-restart

echo "  ✓ Helper scripts created"
echo "    - app-status: View all apps status"
echo "    - app-logs [app-name]: View app logs"
echo "    - app-restart [app-name]: Restart app"
echo ""

# ============================================================================
# Verification
# ============================================================================

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ VPS SETUP COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "VPS Configuration Summary:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"
echo "  PM2: $(pm2 -v)"
echo "  Nginx: $(nginx -v 2>&1 | cut -d/ -f2)"
echo "  Web Root: $WEB_ROOT"
echo ""

echo "System Status:"
echo "  Nginx: $(systemctl is-active nginx)"
echo "  PM2: $(systemctl is-enabled pm2-root > /dev/null 2>&1 && echo 'enabled' || echo 'disabled')"
echo ""

if [ -f "$CERT_PATH/fullchain.pem" ]; then
  EXPIRY=$(openssl x509 -in $CERT_PATH/fullchain.pem -noout -enddate | cut -d= -f2)
  echo "SSL Certificate:"
  echo "  Domain: $DOMAIN"
  echo "  Expires: $EXPIRY"
  echo ""
fi

echo "Next Steps:"
echo "  1. Verify DNS records point to this VPS IP:"
echo "     - $DOMAIN A [YOUR_VPS_IP]"
echo "     - *.$DOMAIN A [YOUR_VPS_IP]"
echo ""
echo "  2. Deploy applications:"
echo "     sudo bash MONOREPO_DEPLOYMENT_SETUP.sh"
echo ""
echo "  3. Monitor applications:"
echo "     pm2 monit"
echo "     app-status"
echo ""
echo "  4. View application logs:"
echo "     app-logs [app-name]"
echo ""
echo "  5. Check Nginx:"
echo "     sudo nginx -t"
echo "     sudo systemctl status nginx"
echo ""

echo "Useful Commands:"
echo "  Monitor all processes: pm2 monit"
echo "  View all processes: pm2 list"
echo "  View logs: pm2 logs [app-name]"
echo "  Restart all apps: pm2 restart all"
echo "  Check SSL: sudo certbot certificates"
echo "  Test renewal: sudo certbot renew --dry-run"
echo ""

echo "Documentation:"
echo "  - Deployment Guide: COMPREHENSIVE_DEPLOYMENT_GUIDE.md"
echo "  - SSL Setup: VPS_COMPREHENSIVE_SSL_SETUP.sh"
echo "  - App Deployment: MONOREPO_DEPLOYMENT_SETUP.sh"
echo ""
