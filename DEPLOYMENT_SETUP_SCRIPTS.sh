#!/bin/bash

################################################################################
# Traffic2uMarketing VPS Deployment - Complete Setup Scripts
#
# This file contains all necessary bash scripts for:
# 1. VPS initial setup and configuration
# 2. Domain and directory structure creation
# 3. App deployment automation
# 4. Monitoring and health checks
#
# Usage: Source this file or run individual functions
# Author: Claude Code Deployment Automation
# Date: November 21, 2025
################################################################################

set -e

# ============================================================================
# CONFIGURATION VARIABLES
# ============================================================================

MAIN_DOMAIN="traffic2u.com"
QUICKSELL_DOMAIN="quicksell.monster"
WEB_ROOT="/var/www"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
APP_USER="appuser"
REPO_URL="http://local_proxy@127.0.0.1:45069/git/kingdavsol/Traffic2umarketing"
LOG_DIR="/var/log/traffic2u"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# ============================================================================
# PHASE 1: VPS INITIAL SETUP
# ============================================================================

setup_vps_system() {
    log_info "Starting VPS system setup..."

    # Update system
    log_info "Updating system packages..."
    apt-get update
    apt-get upgrade -y

    # Install core dependencies
    log_info "Installing core dependencies..."
    apt-get install -y \
        curl wget git vim nano htop \
        build-essential \
        openssl \
        ca-certificates \
        lsb-release \
        gnupg

    log_success "Core dependencies installed"
}

install_nodejs() {
    log_info "Installing Node.js and npm..."

    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs

    # Verify installation
    node --version
    npm --version

    # Install PM2 globally
    npm install -g pm2@latest
    pm2 install pm2-logrotate

    log_success "Node.js, npm, and PM2 installed"
}

install_docker() {
    log_info "Installing Docker and Docker Compose..."

    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

    # Add Docker repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Add user to docker group
    usermod -aG docker $APP_USER

    # Install Docker Compose v2
    apt-get install -y docker-compose

    log_success "Docker and Docker Compose installed"
}

install_nginx() {
    log_info "Installing Nginx..."

    apt-get install -y nginx
    systemctl enable nginx
    systemctl start nginx

    log_success "Nginx installed and started"
}

install_postgresql() {
    log_info "Installing PostgreSQL..."

    apt-get install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql

    log_success "PostgreSQL installed"
}

install_redis() {
    log_info "Installing Redis..."

    apt-get install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server

    log_success "Redis installed"
}

setup_ssl_letsencrypt() {
    log_info "Installing Let's Encrypt certificates..."

    apt-get install -y certbot python3-certbot-nginx

    # Note: This requires interactive input or DNS validation
    # Run manually: certbot certonly --nginx -d traffic2u.com -d *.traffic2u.com -d quicksell.monster

    log_warning "Let's Encrypt installed. Run: sudo certbot certonly --nginx -d traffic2u.com -d *.traffic2u.com -d quicksell.monster"
}

create_deployment_user() {
    log_info "Creating deployment user..."

    if id "$APP_USER" &>/dev/null; then
        log_warning "User $APP_USER already exists"
    else
        useradd -m -s /bin/bash $APP_USER
        usermod -aG docker $APP_USER
        usermod -aG sudo $APP_USER
        log_success "User $APP_USER created"
    fi

    # Create .ssh directory for SSH keys
    mkdir -p /home/$APP_USER/.ssh
    chmod 700 /home/$APP_USER/.ssh
    chown $APP_USER:$APP_USER /home/$APP_USER/.ssh
}

run_full_vps_setup() {
    check_root

    log_info "═══════════════════════════════════════════════════"
    log_info "Starting Complete VPS System Setup"
    log_info "═══════════════════════════════════════════════════"

    setup_vps_system
    install_nodejs
    install_docker
    install_nginx
    install_postgresql
    install_redis
    setup_ssl_letsencrypt
    create_deployment_user

    # Create log directory
    mkdir -p $LOG_DIR
    chmod 755 $LOG_DIR
    chown $APP_USER:$APP_USER $LOG_DIR

    log_success "═══════════════════════════════════════════════════"
    log_success "VPS System Setup Complete!"
    log_success "═══════════════════════════════════════════════════"
    log_info "Next steps:"
    log_info "1. Configure SSL certificates"
    log_info "2. Create domain structure"
    log_info "3. Deploy applications"
}

# ============================================================================
# PHASE 2: CREATE DOMAIN STRUCTURE
# ============================================================================

create_app_directory() {
    local app_name=$1
    local port=$2

    local app_dir="${WEB_ROOT}/${MAIN_DOMAIN}/${app_name}"

    mkdir -p "$app_dir"/{frontend,backend,logs,data,config}
    chown -R $APP_USER:$APP_USER "$app_dir"
    chmod 755 "$app_dir"

    # Create .env template
    cat > "$app_dir/.env.template" <<EOF
NODE_ENV=production
PORT=$port
DATABASE_URL=postgresql://user:password@localhost/dbname
REDIS_URL=redis://localhost:6379
API_KEY=xxx
LOG_DIR=$LOG_DIR/$app_name
EOF

    log_success "Created directory: $app_dir"
}

create_nginx_config() {
    local subdomain=$1
    local port=$2
    local app_name=$3

    local full_domain="${subdomain}.${MAIN_DOMAIN}"
    local config_file="${NGINX_AVAILABLE}/${full_domain}.conf"

    cat > "$config_file" <<'EOF'
# Nginx configuration for Traffic2u App
# Generated: November 21, 2025

# HTTP redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name SUBDOMAIN.MAIN_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name SUBDOMAIN.MAIN_DOMAIN;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/MAIN_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/MAIN_DOMAIN/privkey.pem;

    # SSL configuration
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

    # Reverse proxy to application
    location / {
        proxy_pass http://127.0.0.1:PORT;
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

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:PORT/health;
        access_log off;
    }

    # Logs
    access_log WEB_ROOT/MAIN_DOMAIN/APP_NAME/logs/access.log;
    error_log WEB_ROOT/MAIN_DOMAIN/APP_NAME/logs/error.log warn;
}
EOF

    # Replace placeholders
    sed -i "s|SUBDOMAIN|${subdomain}|g" "$config_file"
    sed -i "s|MAIN_DOMAIN|${MAIN_DOMAIN}|g" "$config_file"
    sed -i "s|PORT|${port}|g" "$config_file"
    sed -i "s|WEB_ROOT|${WEB_ROOT}|g" "$config_file"
    sed -i "s|APP_NAME|${app_name}|g" "$config_file"

    # Enable site
    ln -sf "$config_file" "${NGINX_ENABLED}/${full_domain}.conf" 2>/dev/null || true

    log_success "Created Nginx config for $full_domain"
}

create_all_app_domains() {
    check_root

    log_info "═══════════════════════════════════════════════════"
    log_info "Creating All App Domains and Directories"
    log_info "═══════════════════════════════════════════════════"

    # Create main domain directory
    mkdir -p "${WEB_ROOT}/${MAIN_DOMAIN}"
    chown -R $APP_USER:$APP_USER "${WEB_ROOT}/${MAIN_DOMAIN}"

    # Define all apps: name|subdomain|port
    declare -a APPS=(
        "caption-genius|caption-genius|3000"
        "artisan-hub|artisan-hub|5000"
        "local-eats|local-eats|5000"
        "quality-check|quality-check|5000"
        "no-trace|no-trace|5000"
        "snap-save|snap-save|5000"
        "cashflow-map|cashflow-map|5000"
        "gig-stack|gig-stack|5000"
        "vault-pay|vault-pay|5000"
        "debt-break|debt-break|5000"
        "gig-credit|gig-credit|3000"
        "data-cash|data-cash|3000"
        "neighbor-cash|neighbor-cash|3000"
        "peri-flow|peri-flow|5000"
        "teledoc-local|teledoc-local|5000"
        "nutri-balance|nutri-balance|5000"
        "mental-mate|mental-mate|5000"
        "medi-save|medi-save|3000"
        "active-age|active-age|5000"
        "zen-garden|zen-garden|5000"
        "task-brain|task-brain|5000"
        "memo-shift|memo-shift|5000"
        "code-snap|code-snap|5000"
        "focus-flow|focus-flow|5000"
        "earn-hub|earn-hub|3000"
        "seasonal-earns|seasonal-earns|3000"
        "car-maintenance|car-maintenance|3000"
        "puzzle-quest|puzzle-quest|5000"
        "city-builder|city-builder|5000"
        "story-runner|story-runner|5000"
        "skill-match|skill-match|5000"
        "skill-barter|skill-barter|5000"
        "skill-swap|skill-swap|3000"
        "skill-trade|skill-trade|3000"
        "guard-vault|guard-vault|5000"
        "cipher-text|cipher-text|5000"
        "impact-receipts|impact-receipts|3000"
        "climate-track|climate-track|5000"
        "crew-network|crew-network|5000"
        "aura-read|aura-read|5000"
        "biz-buys|biz-buys|3000"
        "social-tools|social-tools|5000"
        "dashboard|dashboard|3000"
        "app-niches|app-niches|3000"
    )

    # Create directories and Nginx configs for all apps
    for app_spec in "${APPS[@]}"; do
        IFS='|' read -r app_name subdomain port <<< "$app_spec"
        create_app_directory "$app_name" "$port"
        create_nginx_config "$subdomain" "$port" "$app_name"
    done

    log_success "Created all app directories and Nginx configs"
}

create_monorepo_structure() {
    check_root

    log_info "Creating monorepo structures..."

    # Insurance Monorepo
    local insurance_dir="${WEB_ROOT}/${MAIN_DOMAIN}/insurance-monorepo"
    mkdir -p "$insurance_dir"/{apps,packages,logs}
    chown -R $APP_USER:$APP_USER "$insurance_dir"

    # Business Tools Monorepo
    local business_dir="${WEB_ROOT}/${MAIN_DOMAIN}/business-tools-monorepo"
    mkdir -p "$business_dir"/{apps,packages,logs}
    chown -R $APP_USER:$APP_USER "$business_dir"

    log_success "Monorepo structures created"
}

create_quicksell_domain() {
    check_root

    log_info "Creating QuickSell dedicated domain structure..."

    local quicksell_dir="${WEB_ROOT}/${QUICKSELL_DOMAIN}"
    mkdir -p "$quicksell_dir"/{frontend,backend,mobile,logs,data}
    chown -R $APP_USER:$APP_USER "$quicksell_dir"

    # Create Nginx config for quicksell.monster
    create_nginx_config "quicksell" "3000" "quicksell"

    # Also create config for www.quicksell.monster
    local www_config="${NGINX_AVAILABLE}/www.${QUICKSELL_DOMAIN}.conf"
    cp "${NGINX_AVAILABLE}/quicksell.${MAIN_DOMAIN}.conf" "$www_config" 2>/dev/null || true

    log_success "QuickSell domain structure created"
}

test_nginx_config() {
    check_root

    log_info "Testing Nginx configuration..."

    if nginx -t; then
        log_success "Nginx configuration is valid"
        systemctl reload nginx
        return 0
    else
        log_error "Nginx configuration has errors"
        return 1
    fi
}

# ============================================================================
# PHASE 3: APPLICATION DEPLOYMENT
# ============================================================================

deploy_app_from_branch() {
    local branch_name=$1
    local app_name=$2
    local deploy_dir="${WEB_ROOT}/${MAIN_DOMAIN}/${app_name}"

    log_info "Deploying $app_name from branch $branch_name..."

    # Clone app from branch
    local temp_dir="/tmp/deploy_${app_name}_$$"
    mkdir -p "$temp_dir"
    cd "$temp_dir"

    git clone --branch "$branch_name" --single-branch "$REPO_URL" . 2>/dev/null || {
        log_error "Failed to clone branch $branch_name"
        return 1
    }

    # Install dependencies
    if [ -f "package.json" ]; then
        log_info "Installing dependencies for $app_name..."
        npm install --production
    fi

    # Build if needed
    if grep -q '"build"' package.json 2>/dev/null; then
        log_info "Building $app_name..."
        npm run build
    fi

    # Copy to deployment directory
    cp -r . "$deploy_dir/"
    chown -R $APP_USER:$APP_USER "$deploy_dir"

    # Cleanup
    cd /
    rm -rf "$temp_dir"

    log_success "Deployed $app_name successfully"
}

start_app_with_pm2() {
    local app_name=$1
    local app_dir="${WEB_ROOT}/${MAIN_DOMAIN}/${app_name}"

    log_info "Starting $app_name with PM2..."

    cd "$app_dir"

    # Check if package.json exists
    if [ -f "package.json" ]; then
        su - $APP_USER -c "cd $app_dir && pm2 start 'npm start' --name '$app_name' --append-log"
        log_success "Started $app_name with PM2"
    else
        log_error "No package.json found for $app_name"
    fi
}

# ============================================================================
# PHASE 4: MONITORING & HEALTH CHECKS
# ============================================================================

setup_pm2_monitoring() {
    check_root

    log_info "Setting up PM2 monitoring..."

    # Install PM2 modules
    su - $APP_USER -c "pm2 install pm2-logrotate"
    su - $APP_USER -c "pm2 install pm2-auto-pull"

    # Save PM2 state
    su - $APP_USER -c "pm2 save"

    # Create health check script
    cat > /usr/local/bin/traffic2u-health-check <<'EOF'
#!/bin/bash

LOG_FILE="/var/log/traffic2u/health-check.log"

# Function to check app health
check_app_health() {
    local app_name=$1
    local port=$2

    if curl -sf http://127.0.0.1:$port/health &>/dev/null || curl -sf http://127.0.0.1:$port &>/dev/null; then
        echo "✓ $app_name (port $port) is healthy" >> $LOG_FILE
        return 0
    else
        echo "✗ $app_name (port $port) is DOWN" >> $LOG_FILE
        # Attempt to restart
        pm2 restart $app_name
        return 1
    fi
}

# Timestamp
echo "=== Health check at $(date) ===" >> $LOG_FILE

# Check all apps
su - appuser -c "pm2 list" | grep "online" | awk '{print $2}' | while read app; do
    pm2 describe "$app" | grep "port" | awk '{print $NF}' | while read port; do
        check_app_health "$app" "$port"
    done
done
EOF

    chmod +x /usr/local/bin/traffic2u-health-check

    # Add to crontab for every 5 minutes
    (crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/traffic2u-health-check") | crontab -

    log_success "PM2 monitoring setup complete"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

show_usage() {
    cat <<EOF
Traffic2uMarketing VPS Deployment Scripts

USAGE:
    source $0              # Source this file to access functions
    $0 <command>           # Run specific command

AVAILABLE COMMANDS:
    setup-vps              Full VPS system setup
    setup-apps             Create all app directories and domains
    setup-monorepo         Create monorepo structures
    setup-quicksell        Create QuickSell dedicated domain
    test-nginx             Test Nginx configuration
    setup-monitoring       Setup PM2 monitoring

    deploy-app <branch> <name>
                          Deploy app from branch
    start-app <name>       Start app with PM2

EXAMPLES:
    sudo bash $0 setup-vps
    sudo bash $0 setup-apps
    sudo bash $0 deploy-app claude/ai-caption-generator-app caption-genius
    sudo bash $0 start-app caption-genius

EOF
}

# Execute command if provided
if [ $# -eq 0 ]; then
    show_usage
else
    case "$1" in
        setup-vps)
            check_root
            run_full_vps_setup
            ;;
        setup-apps)
            create_all_app_domains
            create_monorepo_structure
            test_nginx_config
            ;;
        setup-monorepo)
            check_root
            create_monorepo_structure
            ;;
        setup-quicksell)
            check_root
            create_quicksell_domain
            test_nginx_config
            ;;
        test-nginx)
            check_root
            test_nginx_config
            ;;
        setup-monitoring)
            check_root
            setup_pm2_monitoring
            ;;
        deploy-app)
            if [ $# -lt 3 ]; then
                log_error "Usage: $0 deploy-app <branch> <app-name>"
                exit 1
            fi
            deploy_app_from_branch "$2" "$3"
            ;;
        start-app)
            if [ $# -lt 2 ]; then
                log_error "Usage: $0 start-app <app-name>"
                exit 1
            fi
            start_app_with_pm2 "$2"
            ;;
        *)
            log_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
fi
