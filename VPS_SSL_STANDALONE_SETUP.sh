#!/bin/bash

################################################################################
# SSL Certificate Setup for 9gg.app and quicksell.monster
# STANDALONE VERSION - No external files needed
#
# This script is completely self-contained:
# - Embeds all Nginx configurations
# - Installs Certbot
# - Gets SSL certificates
# - Configures Nginx
# - Sets up auto-renewal
#
# Run on VPS: bash VPS_SSL_STANDALONE_SETUP.sh
#
# No dependencies, no repo files needed!
#
################################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAINS=("9gg.app" "quicksell.monster")
EMAIL="admin@9gg.app"  # Change this to your email
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
CERTBOT_DIR="/var/www/certbot"

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root (or with sudo)"
        exit 1
    fi
}

install_certbot() {
    log_info "Installing Certbot..."
    apt-get update > /dev/null 2>&1
    apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
    log_success "Certbot installed"
}

create_certbot_dir() {
    log_info "Creating Certbot challenge directory..."
    mkdir -p $CERTBOT_DIR/.well-known/acme-challenge
    chmod -R 755 $CERTBOT_DIR
    log_success "Certbot directory created"
}

create_9gg_app_config() {
    log_info "Creating Nginx config for 9gg.app..."

    cat > $NGINX_SITES_AVAILABLE/9gg.app.conf <<'EOF'
# Nginx Configuration for 9gg.app (Master Domain with Wildcard)

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name 9gg.app *.9gg.app;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server - Main domain (9gg.app)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 9gg.app www.9gg.app;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/9gg.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/9gg.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Root landing page
    location / {
        root /var/www/9gg.app/root;
        try_files $uri $uri/ /index.html;
    }

    # Logs
    access_log /var/log/nginx/9gg.app-access.log;
    error_log /var/log/nginx/9gg.app-error.log warn;
}

# HTTPS server - Wildcard subdomains (*.9gg.app)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name *.9gg.app;

    # SSL configuration (same certificate for wildcard)
    ssl_certificate /etc/letsencrypt/live/9gg.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/9gg.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Extract subdomain name
    set $subdomain $host;
    if ($subdomain ~* ^(.+)\.9gg\.app$) {
        set $subdomain $1;
    }

    # Route to app based on subdomain
    # Apps on port 3000 (Next.js apps)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;

        # WebSocket support
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
        proxy_pass http://127.0.0.1:3000/health;
    }

    # Logs
    access_log /var/log/nginx/9gg.app-subdomains.log;
    error_log /var/log/nginx/9gg.app-subdomains-error.log warn;
}
EOF

    log_success "9gg.app config created"
}

create_quicksell_config() {
    log_info "Creating Nginx config for quicksell.monster..."

    cat > $NGINX_SITES_AVAILABLE/quicksell.monster.conf <<'EOF'
# Nginx Configuration for quicksell.monster (Dedicated Domain)

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name quicksell.monster www.quicksell.monster;

    # Let's Encrypt ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server - quicksell.monster
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name quicksell.monster www.quicksell.monster;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/quicksell.monster/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/quicksell.monster/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Main frontend (port 3000)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API endpoint (port 5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:3000/health;
    }

    # Logs
    access_log /var/log/nginx/quicksell.monster-access.log;
    error_log /var/log/nginx/quicksell.monster-error.log warn;
}
EOF

    log_success "quicksell.monster config created"
}

enable_nginx_sites() {
    log_info "Enabling Nginx sites..."
    ln -sf $NGINX_SITES_AVAILABLE/9gg.app.conf $NGINX_SITES_ENABLED/9gg.app.conf 2>/dev/null || true
    ln -sf $NGINX_SITES_AVAILABLE/quicksell.monster.conf $NGINX_SITES_ENABLED/quicksell.monster.conf 2>/dev/null || true
    log_success "Nginx sites enabled"
}

test_nginx() {
    log_info "Testing Nginx configuration..."
    if nginx -t 2>&1 | grep -q "successful"; then
        log_success "Nginx configuration is valid"
        return 0
    else
        log_error "Nginx configuration failed"
        nginx -t
        return 1
    fi
}

reload_nginx() {
    log_info "Reloading Nginx..."
    systemctl reload nginx || systemctl restart nginx
    log_success "Nginx reloaded"
}

get_ssl_certificate_9gg() {
    log_info "Getting SSL certificate for 9gg.app with wildcard..."

    certbot certonly \
        --webroot \
        -w $CERTBOT_DIR \
        -d 9gg.app \
        -d "*.9gg.app" \
        --agree-tos \
        --non-interactive \
        --email $EMAIL \
        --preferred-challenges http \
        --keep-until-expiring

    if [ -f "/etc/letsencrypt/live/9gg.app/fullchain.pem" ]; then
        log_success "SSL certificate obtained for 9gg.app"
    else
        log_error "Failed to obtain SSL certificate for 9gg.app"
        return 1
    fi
}

get_ssl_certificate_quicksell() {
    log_info "Getting SSL certificate for quicksell.monster..."

    certbot certonly \
        --webroot \
        -w $CERTBOT_DIR \
        -d quicksell.monster \
        -d www.quicksell.monster \
        --agree-tos \
        --non-interactive \
        --email $EMAIL \
        --preferred-challenges http \
        --keep-until-expiring

    if [ -f "/etc/letsencrypt/live/quicksell.monster/fullchain.pem" ]; then
        log_success "SSL certificate obtained for quicksell.monster"
    else
        log_error "Failed to obtain SSL certificate for quicksell.monster"
        return 1
    fi
}

setup_auto_renewal() {
    log_info "Setting up auto-renewal..."

    # Enable certbot renewal timer (systemd)
    systemctl enable certbot.timer
    systemctl start certbot.timer

    log_success "Auto-renewal configured (certbot.timer)"
}

verify_certificates() {
    log_info "Verifying certificates..."

    for domain in "${DOMAINS[@]}"; do
        if [ -f "/etc/letsencrypt/live/$domain/fullchain.pem" ]; then
            expiry=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$domain/fullchain.pem" | cut -d= -f2)
            log_success "$domain: Certificate valid until $expiry"
        else
            log_error "$domain: Certificate not found"
            return 1
        fi
    done
}

# Main execution
main() {
    check_root

    log_info "═══════════════════════════════════════════════════════"
    log_info "SSL Certificate Setup for 9gg.app and quicksell.monster"
    log_info "STANDALONE VERSION (No external files needed)"
    log_info "═══════════════════════════════════════════════════════"
    echo ""

    # Step 1: Install Certbot
    if ! command -v certbot &> /dev/null; then
        install_certbot
    else
        log_success "Certbot already installed"
    fi
    echo ""

    # Step 2: Create Certbot challenge directory
    create_certbot_dir
    echo ""

    # Step 3: Create Nginx configs (embedded)
    create_9gg_app_config
    create_quicksell_config
    echo ""

    # Step 4: Enable sites
    enable_nginx_sites
    echo ""

    # Step 5: Test Nginx
    if ! test_nginx; then
        log_error "Nginx configuration invalid. Fix errors above and retry."
        exit 1
    fi
    echo ""

    # Step 6: Reload Nginx
    reload_nginx
    echo ""

    # Wait for services to stabilize
    log_info "Waiting 10 seconds for services to stabilize..."
    sleep 10
    echo ""

    # Step 7: Get SSL certificates
    if get_ssl_certificate_9gg; then
        log_success "Certificate 1/2 obtained"
    else
        log_error "Failed to get 9gg.app certificate"
        exit 1
    fi
    echo ""

    if get_ssl_certificate_quicksell; then
        log_success "Certificate 2/2 obtained"
    else
        log_error "Failed to get quicksell.monster certificate"
        exit 1
    fi
    echo ""

    # Step 8: Reload Nginx with SSL
    log_info "Reloading Nginx with SSL configuration..."
    reload_nginx
    echo ""

    # Step 9: Setup auto-renewal
    setup_auto_renewal
    echo ""

    # Step 10: Verify
    verify_certificates
    echo ""

    log_info "═══════════════════════════════════════════════════════"
    log_success "SSL Setup Complete!"
    log_info "═══════════════════════════════════════════════════════"
    echo ""
    log_info "Certificates installed for:"
    log_info "  ✓ 9gg.app (with *.9gg.app wildcard)"
    log_info "  ✓ quicksell.monster (with www.quicksell.monster)"
    echo ""
    log_info "All domains now redirect HTTP to HTTPS"
    log_info "Auto-renewal enabled via certbot.timer"
    echo ""
    log_info "Next steps:"
    log_info "  1. Run verification: bash VERIFY_DOMAINS_SSL.sh"
    log_info "  2. Deploy apps: git push origin [branch-name]"
    log_info "  3. Test domains: curl https://9gg.app"
    echo ""
    log_info "═══════════════════════════════════════════════════════"
}

# Run main
main "$@"
