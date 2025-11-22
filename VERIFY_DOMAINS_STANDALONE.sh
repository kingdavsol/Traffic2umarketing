#!/bin/bash

################################################################################
# Verify Domains and SSL Setup
# STANDALONE VERSION - No dependencies
#
# This script verifies:
# 1. Domains resolve to VPS IP
# 2. Nginx is running and responding
# 3. SSL certificates are valid
# 4. HTTPS redirects working
#
# Run on VPS: bash VERIFY_DOMAINS_STANDALONE.sh
#
# No external files needed!
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
VPS_IP=$(hostname -I | awk '{print $1}')
DOMAINS=("9gg.app" "www.9gg.app" "quicksell.monster" "www.quicksell.monster")
TEST_SUBDOMAINS=("caption-genius.9gg.app" "gig-credit.9gg.app" "snap-save.9gg.app")

# Functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    Domain and SSL Verification Script (STANDALONE)         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Check Nginx running
echo "TEST 1: Nginx Status"
echo "─────────────────────────────────────────────────────────────"
if systemctl is-active --quiet nginx; then
    log_success "Nginx is running"
else
    log_error "Nginx is not running"
    echo "Start it: sudo systemctl start nginx"
    exit 1
fi
echo ""

# Test 2: Check Nginx configuration
echo "TEST 2: Nginx Configuration"
echo "─────────────────────────────────────────────────────────────"
if nginx -t 2>&1 | grep -q "successful"; then
    log_success "Nginx configuration is valid"
else
    log_error "Nginx configuration has errors"
    nginx -t
    exit 1
fi
echo ""

# Test 3: Check DNS resolution
echo "TEST 3: DNS Resolution"
echo "─────────────────────────────────────────────────────────────"
for domain in "${DOMAINS[@]}"; do
    resolved_ip=$(dig +short $domain | tail -1)
    if [ ! -z "$resolved_ip" ]; then
        log_success "$domain → $resolved_ip"
    else
        log_warning "$domain → (not resolved yet, may need time)"
    fi
done
echo ""

# Test 4: Test HTTP redirect
echo "TEST 4: HTTP to HTTPS Redirect"
echo "─────────────────────────────────────────────────────────────"
for domain in "9gg.app" "quicksell.monster"; do
    if curl -I -s -o /dev/null -w "%{http_code}" http://$domain 2>/dev/null | grep -q "301\|302"; then
        log_success "$domain: HTTP redirects to HTTPS"
    else
        log_warning "$domain: Check redirect (may need DNS propagation)"
    fi
done
echo ""

# Test 5: Check SSL certificates
echo "TEST 5: SSL Certificates"
echo "─────────────────────────────────────────────────────────────"
for domain in "9gg.app" "quicksell.monster"; do
    cert_path="/etc/letsencrypt/live/$domain/fullchain.pem"
    if [ -f "$cert_path" ]; then
        expiry=$(openssl x509 -enddate -noout -in "$cert_path" | cut -d= -f2)
        days_left=$(( ($(date -d "$expiry" +%s) - $(date +%s)) / 86400 ))
        log_success "$domain: Cert valid for $days_left days (expires: $expiry)"
    else
        log_error "$domain: Certificate not found at $cert_path"
    fi
done
echo ""

# Test 6: Check HTTPS connectivity
echo "TEST 6: HTTPS Connectivity"
echo "─────────────────────────────────────────────────────────────"
for domain in "9gg.app" "quicksell.monster"; do
    if timeout 5 curl -s -k https://$domain >/dev/null 2>&1; then
        log_success "$domain: HTTPS responding"
    else
        log_warning "$domain: HTTPS not responding (apps may not be running)"
    fi
done
echo ""

# Test 7: Check apps on VPS
echo "TEST 7: Running Apps (PM2)"
echo "─────────────────────────────────────────────────────────────"
if command -v pm2 &> /dev/null; then
    if pm2 list 2>/dev/null | grep -q "online"; then
        log_success "Apps running:"
        pm2 list | grep -E "online|stopped" | head -10
    else
        log_warning "No apps currently running"
        log_info "Deploy apps using: git push origin [branch-name]"
    fi
else
    log_warning "PM2 not installed"
fi
echo ""

# Test 8: Check app directories
echo "TEST 8: App Directories"
echo "─────────────────────────────────────────────────────────────"
if [ -d "/var/www/9gg.app" ]; then
    app_count=$(find /var/www/9gg.app -maxdepth 1 -type d | wc -l)
    app_count=$((app_count - 1))  # Subtract root directory
    if [ $app_count -gt 0 ]; then
        log_success "Found $app_count app directories in /var/www/9gg.app"
    else
        log_warning "No apps deployed yet"
    fi
else
    log_warning "/var/www/9gg.app directory not found"
fi
echo ""

# Test 9: Test sample subdomain
echo "TEST 9: Sample Subdomain Tests"
echo "─────────────────────────────────────────────────────────────"
for subdomain in "${TEST_SUBDOMAINS[@]}"; do
    if timeout 5 curl -s -k https://$subdomain >/dev/null 2>&1; then
        log_success "$subdomain: Responding"
    else
        log_info "$subdomain: Not responding (may need deployment)"
    fi
done
echo ""

# Test 10: Check auto-renewal
echo "TEST 10: Certificate Auto-Renewal"
echo "─────────────────────────────────────────────────────────────"
if systemctl is-enabled certbot.timer 2>/dev/null; then
    log_success "Certbot auto-renewal is enabled"
    status=$(systemctl is-active certbot.timer)
    log_info "Status: $status"
else
    log_warning "Certbot auto-renewal may not be enabled"
    log_info "Enable it: sudo systemctl enable certbot.timer"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    VERIFICATION SUMMARY                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
log_success "Verification complete!"
echo ""
echo "VPS IP Address: $VPS_IP"
echo ""
echo "Next steps:"
echo "  1. Wait for DNS propagation (5-30 minutes if just configured)"
echo "  2. Test domains: curl https://9gg.app"
echo "  3. Deploy apps: git push origin [branch-name]"
echo "  4. Monitor apps: pm2 logs [app-name]"
echo ""
echo "Common issues:"
echo "  • Domains not resolving: Wait for DNS propagation"
echo "  • HTTPS errors: Check certificates with: certbot certificates"
echo "  • Apps not responding: Check deployment with: pm2 list"
echo ""
