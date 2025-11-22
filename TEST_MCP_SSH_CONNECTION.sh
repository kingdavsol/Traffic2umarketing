#!/bin/bash

################################################################################
# Claude Code MCP SSH Connection Tester
#
# This script tests whether Claude Code can successfully connect to your
# Hostinger VPS via SSH MCP.
#
# Run this on your LOCAL MACHINE to verify setup is working.
#
# Usage: bash TEST_MCP_SSH_CONNECTION.sh
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="$HOME/.ssh/id_claude_vps"
SSH_USER="claude-deploy"

# Functions
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

# Main test
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       Claude Code MCP SSH Connection Tester                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Get VPS IP from user if not provided
if [ -z "$VPS_IP" ]; then
    echo -n "Enter your Hostinger VPS IP address: "
    read -r VPS_IP
fi

if [ -z "$VPS_IP" ]; then
    log_error "VPS IP not provided"
    exit 1
fi

log_info "Testing connection to: $VPS_IP"
echo ""

# Test 1: Check SSH key exists
echo "TEST 1: Checking SSH key..."
if [ -f "$SSH_KEY" ]; then
    log_success "SSH key found: $SSH_KEY"
    key_size=$(ssh-keygen -l -f "$SSH_KEY" 2>/dev/null | awk '{print $1}')
    key_type=$(ssh-keygen -l -f "$SSH_KEY" 2>/dev/null | awk '{print $NF}')
    log_info "  Key type: $key_type (size: $key_size bits)"
else
    log_error "SSH key not found at $SSH_KEY"
    log_info "Generate it with: ssh-keygen -t ed25519 -f $SSH_KEY -N \"\""
    exit 1
fi
echo ""

# Test 2: Check SSH key permissions
echo "TEST 2: Checking SSH key permissions..."
key_perms=$(stat -f '%OLp' "$SSH_KEY" 2>/dev/null || stat -c '%a' "$SSH_KEY" 2>/dev/null)
if [ "$key_perms" = "600" ] || [ "$key_perms" = "-rw-------" ]; then
    log_success "SSH key permissions are correct (600)"
else
    log_warning "SSH key permissions are $key_perms (should be 600)"
    log_info "Fixing permissions: chmod 600 $SSH_KEY"
    chmod 600 "$SSH_KEY"
    log_success "Permissions fixed"
fi
echo ""

# Test 3: Test basic SSH connectivity
echo "TEST 3: Testing SSH connection..."
if timeout 10 ssh -i "$SSH_KEY" -o ConnectTimeout=5 -o BatchMode=yes "$SSH_USER@$VPS_IP" "whoami" > /tmp/ssh_test.txt 2>&1; then
    result=$(cat /tmp/ssh_test.txt)
    if [ "$result" = "$SSH_USER" ]; then
        log_success "SSH connection successful!"
        log_info "  User: $result"
    else
        log_error "SSH connected but got unexpected user: $result"
        exit 1
    fi
else
    log_error "SSH connection failed"
    log_info "Error details:"
    cat /tmp/ssh_test.txt | sed 's/^/  /'
    echo ""
    log_info "Troubleshooting:"
    log_info "  1. Verify VPS IP is correct"
    log_info "  2. Ensure claude-deploy user exists on VPS"
    log_info "  3. Check public key is in ~/.ssh/authorized_keys on VPS"
    log_info "  4. Verify SSH service is running on VPS"
    exit 1
fi
echo ""

# Test 4: Check if MCP server is installed
echo "TEST 4: Checking MCP SSH server installation..."
if npm list -g @modelcontextprotocol/server-ssh &>/dev/null; then
    mcp_version=$(npm view @modelcontextprotocol/server-ssh version 2>/dev/null || echo "unknown")
    log_success "MCP SSH server is installed"
    log_info "  Version: $mcp_version"
else
    log_error "MCP SSH server not found"
    log_info "Install it with: npm install -g @modelcontextprotocol/server-ssh"
    exit 1
fi
echo ""

# Test 5: Check Claude MCP configuration
echo "TEST 5: Checking Claude Code MCP configuration..."
mcp_config="$HOME/.claude/mcp.json"
if [ -f "$mcp_config" ]; then
    log_success "MCP configuration found: $mcp_config"

    # Check if VPS SSH config exists in JSON
    if grep -q "vps-ssh" "$mcp_config"; then
        log_success "VPS SSH server configured in mcp.json"

        # Extract and verify config
        if grep -q "@modelcontextprotocol/server-ssh" "$mcp_config"; then
            log_success "SSH server command configured correctly"
        else
            log_error "SSH server command not found in mcp.json"
            exit 1
        fi
    else
        log_error "VPS SSH configuration not found in mcp.json"
        log_info "Add the configuration from: $(dirname $mcp_config)/mcp.json.template"
        exit 1
    fi
else
    log_error "MCP configuration not found at $mcp_config"
    log_info "Create it using the template: mcp.json.template"
    exit 1
fi
echo ""

# Test 6: Check configuration file permissions
echo "TEST 6: Checking MCP configuration permissions..."
mcp_perms=$(stat -f '%OLp' "$mcp_config" 2>/dev/null || stat -c '%a' "$mcp_config" 2>/dev/null)
if [ "$mcp_perms" = "600" ] || [ "$mcp_perms" = "-rw-------" ]; then
    log_success "MCP configuration permissions are correct (600)"
else
    log_warning "MCP configuration permissions are $mcp_perms (should be 600)"
    chmod 600 "$mcp_config"
    log_success "Permissions fixed"
fi
echo ""

# Test 7: Test VPS commands
echo "TEST 7: Testing common VPS commands..."
commands=("whoami" "hostname" "pwd" "node --version" "docker --version")
for cmd in "${commands[@]}"; do
    if output=$(ssh -i "$SSH_KEY" -o BatchMode=yes "$SSH_USER@$VPS_IP" "$cmd" 2>&1); then
        log_success "Command '$cmd': $output"
    else
        log_warning "Command '$cmd' failed or not available"
    fi
done
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     SUMMARY & NEXT STEPS                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
log_success "All basic tests passed! ✓"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code to load the new MCP configuration"
echo "  2. In Claude Code, try: Run 'whoami' on the VPS via SSH"
echo "  3. Claude should respond: 'claude-deploy'"
echo ""
echo "If Claude Code still can't access the VPS:"
echo "  1. Check ~/.claude/mcp.json is properly formatted JSON"
echo "  2. Verify SSH_HOST and SSH_PRIVATE_KEY_PATH are correct"
echo "  3. Try running Claude Code from terminal to see error messages"
echo ""
echo "Common next commands to try in Claude Code:"
echo "  • Run: pm2 list  (on the VPS)"
echo "  • Run: ls /var/www/  (on the VPS)"
echo "  • Run: docker ps  (on the VPS)"
echo ""

rm -f /tmp/ssh_test.txt
