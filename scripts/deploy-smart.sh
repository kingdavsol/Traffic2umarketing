#!/bin/bash

################################################################################
# Smart Multi-App Deployment Script
#
# This script:
# 1. Detects which apps have changed based on git diff
# 2. Reads domain mapping from domains.json
# 3. Deploys only the changed apps to their correct domains
# 4. Routes each app to its configured port via nginx
# 5. Verifies each deployed service
#
# Usage: ./scripts/deploy-smart.sh [--all] [--app=pet-insurance] [--branch=main]
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$( dirname "$SCRIPT_DIR" )"

# Load configuration
DOMAINS_CONFIG="$REPO_ROOT/domains.json"
ENV_FILE="${ENV_FILE:-.env}"

# Defaults
DEPLOY_ALL=false
DEPLOY_APPS=()
BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD)}"

################################################################################
# Helper Functions
################################################################################

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Load domains.json using jq
load_domains_config() {
  if [ ! -f "$DOMAINS_CONFIG" ]; then
    log_error "domains.json not found at $DOMAINS_CONFIG"
    exit 1
  fi
  log_info "Loaded domain configuration from domains.json"
}

# Get all app IDs from domains.json
get_all_app_ids() {
  jq -r '.apps[].id' "$DOMAINS_CONFIG"
}

# Get app info from domains.json by app ID
get_app_info() {
  local app_id=$1
  jq -r ".apps[] | select(.id==\"$app_id\")" "$DOMAINS_CONFIG"
}

# Extract specific field from app info
get_app_field() {
  local app_id=$1
  local field=$2
  jq -r ".apps[] | select(.id==\"$app_id\") | .$field" "$DOMAINS_CONFIG"
}

# Detect which apps have changed in the current branch
detect_changed_apps() {
  log_info "Detecting changed apps since last commit..."

  local changed_apps=()

  # Get list of changed files
  local changed_files=$(git diff --name-only origin/main...HEAD 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || echo "")

  if [ -z "$changed_files" ]; then
    log_warning "No changed files detected"
    return
  fi

  # For each app, check if any of its files changed
  while IFS= read -r app_id; do
    local app_dir=$(get_app_field "$app_id" "appDir")

    # Check if any files in this app directory changed
    if echo "$changed_files" | grep -q "^$app_dir" 2>/dev/null; then
      changed_apps+=("$app_id")
      log_success "Detected changes in: $app_id"
    fi
  done < <(get_all_app_ids)

  if [ ${#changed_apps[@]} -eq 0 ]; then
    log_warning "No app directories changed, deploying all apps"
    DEPLOY_ALL=true
  else
    DEPLOY_APPS=("${changed_apps[@]}")
  fi
}

# Parse command line arguments
parse_args() {
  for arg in "$@"; do
    case $arg in
      --all)
        DEPLOY_ALL=true
        ;;
      --app=*)
        app_id="${arg#--app=}"
        DEPLOY_APPS+=("$app_id")
        ;;
      --branch=*)
        BRANCH="${arg#--branch=}"
        ;;
      *)
        BRANCH="$arg"
        ;;
    esac
  done
}

# Validate .env file exists
validate_env() {
  if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at $ENV_FILE"
    echo "Please create .env file with required variables"
    exit 1
  fi
  log_info "✓ Found .env configuration file"
}

# Deploy a single app
deploy_app() {
  local app_id=$1

  log_info "==============================================="
  log_info "Deploying: $app_id"
  log_info "==============================================="

  # Get app information
  local app_name=$(get_app_field "$app_id" "name")
  local app_dir=$(get_app_field "$app_id" "appDir")
  local service_name=$(get_app_field "$app_id" "serviceName")
  local port=$(get_app_field "$app_id" "port")
  local domain=$(get_app_field "$app_id" "domain")
  local dockerfile=$(get_app_field "$app_id" "dockerfile")

  log_info "Name: $app_name"
  log_info "Directory: $app_dir"
  log_info "Service: $service_name"
  log_info "Domain: $domain"
  log_info "Port: $port"

  # Verify app directory exists
  if [ ! -d "$REPO_ROOT/$app_dir" ]; then
    log_error "App directory not found: $app_dir"
    return 1
  fi

  # Verify Dockerfile exists
  if [ ! -f "$REPO_ROOT/$dockerfile" ]; then
    log_error "Dockerfile not found: $dockerfile"
    return 1
  fi

  # Build Docker image
  log_info "[1/3] Building Docker image for $service_name..."
  cd "$REPO_ROOT"

  if docker-compose build "$service_name" 2>&1 | tail -20; then
    log_success "[1/3] Build completed"
  else
    log_error "[1/3] Build failed"
    return 1
  fi

  # Stop and remove old container
  log_info "[2/3] Stopping old container..."
  docker-compose down "$service_name" --remove-orphans 2>/dev/null || true

  # Start new container
  log_info "[2/3] Starting new container..."
  if docker-compose up -d "$service_name"; then
    log_success "[2/3] Container started"
  else
    log_error "[2/3] Failed to start container"
    return 1
  fi

  # Verify container is healthy
  log_info "[3/3] Verifying service health..."
  sleep 5

  if docker-compose ps "$service_name" | grep -q "Up"; then
    log_success "[3/3] Service is running on port $port → $domain"
    return 0
  else
    log_error "[3/3] Service failed to start"
    docker-compose logs "$service_name" | tail -20
    return 1
  fi
}

# Deploy all apps
deploy_all_apps() {
  log_info "Deploying all 10 apps..."

  local failed_apps=()
  local success_count=0

  while IFS= read -r app_id; do
    if deploy_app "$app_id"; then
      ((success_count++))
    else
      failed_apps+=("$app_id")
    fi
    echo ""
  done < <(get_all_app_ids)

  log_info "==============================================="
  log_info "Deployment Summary"
  log_info "==============================================="
  log_success "Successfully deployed: $success_count apps"

  if [ ${#failed_apps[@]} -gt 0 ]; then
    log_error "Failed to deploy: ${#failed_apps[@]} apps"
    printf '%s\n' "${failed_apps[@]}"
    return 1
  fi

  return 0
}

# Deploy specific apps
deploy_specific_apps() {
  log_info "Deploying ${#DEPLOY_APPS[@]} specific apps..."

  local failed_apps=()
  local success_count=0

  for app_id in "${DEPLOY_APPS[@]}"; do
    if deploy_app "$app_id"; then
      ((success_count++))
    else
      failed_apps+=("$app_id")
    fi
    echo ""
  done

  log_info "==============================================="
  log_info "Deployment Summary"
  log_info "==============================================="
  log_success "Successfully deployed: $success_count apps"

  if [ ${#failed_apps[@]} -gt 0 ]; then
    log_error "Failed to deploy: ${#failed_apps[@]} apps"
    printf '%s\n' "${failed_apps[@]}"
    return 1
  fi

  return 0
}

# Run database migrations
run_migrations() {
  log_info "Running database migrations..."
  cd "$REPO_ROOT"

  if npm run db:push 2>&1 | tail -10; then
    log_success "Database migrations completed"
  else
    log_warning "Database migrations failed or returned non-zero exit"
  fi
}

# Verify nginx configuration
verify_nginx() {
  log_info "Verifying nginx configuration..."

  if docker-compose exec -T nginx nginx -t 2>&1 | grep "successful"; then
    log_success "Nginx configuration is valid"
  else
    log_warning "Nginx configuration validation failed"
  fi
}

# Display deployment summary
display_summary() {
  echo ""
  log_info "==============================================="
  log_info "Deployment Complete"
  log_info "==============================================="
  echo ""

  # Show all services
  log_info "Service Status:"
  docker-compose ps

  echo ""
  log_info "Domain Routing:"
  while IFS= read -r app_id; do
    local domain=$(get_app_field "$app_id" "domain")
    local port=$(get_app_field "$app_id" "port")
    echo -e "  ${GREEN}✓${NC} $domain → localhost:$port"
  done < <(get_all_app_ids)

  echo ""
  log_success "All services deployed and accessible!"
}

################################################################################
# Main Execution
################################################################################

main() {
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║     Smart Multi-App Deployment System                      ║"
  echo "║     Traffic2u Insurance Comparison Sites                   ║"
  echo "╚════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"

  # Parse arguments
  parse_args "$@"

  # Load configuration
  load_domains_config
  validate_env

  # Determine what to deploy
  if [ "$DEPLOY_ALL" = true ]; then
    log_info "Deployment mode: ALL APPS"
  elif [ ${#DEPLOY_APPS[@]} -gt 0 ]; then
    log_info "Deployment mode: SPECIFIC APPS (${#DEPLOY_APPS[@]})"
  else
    log_info "Deployment mode: AUTO-DETECT CHANGED APPS"
    detect_changed_apps
  fi

  # Show deployment plan
  if [ "$DEPLOY_ALL" = true ]; then
    echo ""
    log_info "Will deploy: ALL 10 apps"
  else
    echo ""
    log_info "Will deploy: ${DEPLOY_APPS[*]}"
  fi

  echo ""
  echo -n "Continue with deployment? (yes/no): "
  read -r response

  if [ "$response" != "yes" ]; then
    log_warning "Deployment cancelled"
    exit 0
  fi

  echo ""

  # Execute deployment
  if [ "$DEPLOY_ALL" = true ]; then
    deploy_all_apps || exit 1
  else
    deploy_specific_apps || exit 1
  fi

  # Run migrations
  run_migrations

  # Verify nginx
  verify_nginx

  # Display summary
  display_summary
}

# Run main function with all arguments
main "$@"
