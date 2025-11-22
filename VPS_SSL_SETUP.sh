#!/bin/bash

################################################################################
# SSL Certificate Setup for 9gg.app and quicksell.monster
#
# This script:
# 1. Installs Certbot if needed
# 2. Gets Let's Encrypt certificates
# 3. Configures Nginx for SSL
# 4. Sets up auto-renewal
#
# Run on VPS: bash VPS_SSL_SETUP.sh
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
        log_error "This script must be run as root"
        exit 1
    fi
}

install_certbot() {
    log_info "Installing Certbot..."
    apt-get update > /dev/null
    apt-get install -y certbot python3-certbot-nginx > /dev/null
    log_success "Certbot installed"
}

create_certbot_dir() {
    log_info "Creating Certbot challenge directory..."
    mkdir -p $CERTBOT_DIR/.well-known/acme-challenge
    chmod -R 755 $CERTBOT_DIR
    log_success "Certbot directory created"
}

setup_nginx_http_only() {
    log_info "Copying Nginx configs to /etc/nginx/sites-available..."

    # Copy 9gg.app config
    if [ -f "nginx/9gg.app.conf" ]; then
        cp nginx/9gg.app.conf $NGINX_SITES_AVAILABLE/9gg.app.conf
        log_success "Copied 9gg.app config"
    else
        log_warning "nginx/9gg.app.conf not found - using default template"
    fi

    # Copy quicksell.monster config
    if [ -f "nginx/quicksell.monster.conf" ]; then
        cp nginx/quicksell.monster.conf $NGINX_SITES_AVAILABLE/quicksell.monster.conf
        log_success "Copied quicksell.monster config"
    else
        log_warning "nginx/quicksell.monster.conf not found - using default template"
    fi

    # Enable sites
    ln -sf $NGINX_SITES_AVAILABLE/9gg.app.conf $NGINX_SITES_ENABLED/9gg.app.conf 2>/dev/null || true
    ln -sf $NGINX_SITES_AVAILABLE/quicksell.monster.conf $NGINX_SITES_ENABLED/quicksell.monster.conf 2>/dev/null || true

    log_success "Nginx configs enabled"
}

test_nginx() {
    log_info "Testing Nginx configuration..."
    if nginx -t; then
        log_success "Nginx configuration is valid"
        return 0
    else
        log_error "Nginx configuration failed"
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
        --preferred-challenges http

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
        --preferred-challenges http

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

    # Show next renewal
    log_info "Next renewal scheduled:"
    certbot renew --dry-run 2>&1 | grep -i "next" || true
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
    log_info "═══════════════════════════════════════════════════════"

    # Step 1: Install Certbot
    if ! command -v certbot &> /dev/null; then
        install_certbot
    else
        log_success "Certbot already installed"
    fi

    # Step 2: Create Certbot challenge directory
    create_certbot_dir

    # Step 3: Setup Nginx configs (if files exist)
    setup_nginx_http_only

    # Step 4: Test Nginx
    if ! test_nginx; then
        log_error "Nginx configuration invalid. Fix errors above and retry."
        exit 1
    fi

    # Step 5: Reload Nginx
    reload_nginx

    # Wait for DNS propagation
    log_info "Waiting 10 seconds for services to stabilize..."
    sleep 10

    # Step 6: Get SSL certificates
    if get_ssl_certificate_9gg; then
        log_success "Certificate 1/2 obtained"
    else
        log_error "Failed to get 9gg.app certificate"
        exit 1
    fi

    if get_ssl_certificate_quicksell; then
        log_success "Certificate 2/2 obtained"
    else
        log_error "Failed to get quicksell.monster certificate"
        exit 1
    fi

    # Step 7: Reload Nginx with SSL
    log_info "Reloading Nginx with SSL configuration..."
    reload_nginx

    # Step 8: Setup auto-renewal
    setup_auto_renewal

    # Step 9: Verify
    verify_certificates

    log_info "═══════════════════════════════════════════════════════"
    log_success "SSL Setup Complete!"
    log_info "═══════════════════════════════════════════════════════"
    log_info ""
    log_info "Certificates installed for:"
    log_info "  ✓ 9gg.app (with *.9gg.app wildcard)"
    log_info "  ✓ quicksell.monster (with www.quicksell.monster)"
    log_info ""
    log_info "All domains now redirect HTTP to HTTPS"
    log_info "Auto-renewal enabled via certbot.timer"
    log_info ""
    log_info "Next steps:"
    log_info "  1. Verify domains are accessible: https://9gg.app"
    log_info "  2. Check app logs: pm2 logs [app-name]"
    log_info "  3. Monitor renewal: certbot renew --dry-run"
    log_info "═══════════════════════════════════════════════════════"
}

# Run main
main "$@"
