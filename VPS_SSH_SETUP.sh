#!/bin/bash

################################################################################
# VPS SSH Setup Helper Script
#
# This script automates the VPS-side setup for Claude Code SSH MCP access.
# Run this on your Hostinger VPS as root after SSHing in.
#
# Usage: bash VPS_SSH_SETUP.sh <option>
#
# Options:
#   create-user        Create claude-deploy user
#   add-pubkey         Add SSH public key to authorized_keys
#   harden-ssh         Harden SSH security settings
#   setup-all          Do all of the above
#   verify             Verify setup is correct
#
# Example:
#   ssh root@your-vps-ip "curl -s https://raw.github.com/.../VPS_SSH_SETUP.sh | bash -s setup-all"
#
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function definitions
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

create_claude_user() {
    log_info "Creating claude-deploy user..."

    if id "claude-deploy" &>/dev/null; then
        log_warning "User 'claude-deploy' already exists, skipping creation"
        return
    fi

    # Create user
    useradd -m -s /bin/bash claude-deploy
    log_success "Created user 'claude-deploy'"

    # Set password (optional)
    log_info "Setting password for claude-deploy user..."
    echo "claude-deploy:ChangeMe123!" | chpasswd
    log_warning "Default password set to 'ChangeMe123!' - please change it:"
    log_warning "  Command: passwd claude-deploy"

    # Add to sudo group
    usermod -aG sudo claude-deploy
    log_success "Added claude-deploy to sudo group"

    # Add to docker group (if Docker installed)
    if command -v docker &> /dev/null; then
        usermod -aG docker claude-deploy
        log_success "Added claude-deploy to docker group"
    fi

    # Create .ssh directory
    mkdir -p /home/claude-deploy/.ssh
    chmod 700 /home/claude-deploy/.ssh
    chown -R claude-deploy:claude-deploy /home/claude-deploy/.ssh
    log_success "Created .ssh directory with proper permissions"

    # Configure sudoers for passwordless sudo
    log_info "Configuring passwordless sudo..."
    echo "claude-deploy ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/claude-deploy > /dev/null
    log_success "Configured passwordless sudo"
}

add_public_key() {
    log_info "Adding SSH public key to authorized_keys..."

    if [ -z "$SSH_PUBLIC_KEY" ]; then
        log_error "SSH_PUBLIC_KEY environment variable not set"
        log_info "Usage: SSH_PUBLIC_KEY='ssh-ed25519 AAAAC3...' bash $0 add-pubkey"
        exit 1
    fi

    # Switch to claude-deploy user context
    cat >> /home/claude-deploy/.ssh/authorized_keys <<EOF
$SSH_PUBLIC_KEY
EOF

    # Set proper permissions
    chmod 600 /home/claude-deploy/.ssh/authorized_keys
    chown claude-deploy:claude-deploy /home/claude-deploy/.ssh/authorized_keys

    log_success "Added public key to authorized_keys"
    log_success "Key count: $(wc -l < /home/claude-deploy/.ssh/authorized_keys)"
}

harden_ssh() {
    log_info "Hardening SSH security..."

    SSH_CONFIG="/etc/ssh/sshd_config"

    # Backup original config
    cp "$SSH_CONFIG" "$SSH_CONFIG.backup.$(date +%s)"
    log_success "Backed up original SSH config"

    # Disable root login
    if grep -q "^#PermitRootLogin" "$SSH_CONFIG"; then
        sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' "$SSH_CONFIG"
    elif grep -q "^PermitRootLogin" "$SSH_CONFIG"; then
        sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' "$SSH_CONFIG"
    else
        echo "PermitRootLogin no" >> "$SSH_CONFIG"
    fi
    log_success "Disabled root login"

    # Disable password authentication
    if grep -q "^#PasswordAuthentication" "$SSH_CONFIG"; then
        sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' "$SSH_CONFIG"
    elif grep -q "^PasswordAuthentication" "$SSH_CONFIG"; then
        sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' "$SSH_CONFIG"
    else
        echo "PasswordAuthentication no" >> "$SSH_CONFIG"
    fi
    log_success "Disabled password authentication"

    # Enable pubkey authentication (should already be enabled, but ensure it)
    if grep -q "^#PubkeyAuthentication" "$SSH_CONFIG"; then
        sed -i 's/^#PubkeyAuthentication.*/PubkeyAuthentication yes/' "$SSH_CONFIG"
    fi
    log_success "Enabled public key authentication"

    # Test SSH config
    if sshd -t; then
        log_success "SSH configuration is valid"
    else
        log_error "SSH configuration test failed!"
        log_error "Restoring backup..."
        cp "$SSH_CONFIG.backup.$(date +%s)" "$SSH_CONFIG"
        exit 1
    fi

    # Restart SSH service
    if systemctl restart ssh; then
        log_success "Restarted SSH service"
    else
        log_error "Failed to restart SSH service"
        exit 1
    fi
}

verify_setup() {
    log_info "Verifying Claude SSH setup..."

    # Check if user exists
    if id "claude-deploy" &>/dev/null; then
        log_success "User 'claude-deploy' exists"
    else
        log_error "User 'claude-deploy' does not exist"
        return 1
    fi

    # Check .ssh directory
    if [ -d /home/claude-deploy/.ssh ]; then
        log_success ".ssh directory exists"
    else
        log_error ".ssh directory does not exist"
        return 1
    fi

    # Check authorized_keys
    if [ -f /home/claude-deploy/.ssh/authorized_keys ]; then
        key_count=$(wc -l < /home/claude-deploy/.ssh/authorized_keys)
        if [ "$key_count" -gt 0 ]; then
            log_success "authorized_keys exists with $key_count key(s)"
        else
            log_error "authorized_keys is empty"
            return 1
        fi
    else
        log_warning "authorized_keys does not exist yet (can add manually)"
    fi

    # Check sudoers
    if sudo -l -U claude-deploy -n true 2>/dev/null; then
        log_success "claude-deploy can run sudo without password"
    else
        log_warning "claude-deploy requires password for sudo"
    fi

    # Check SSH hardening
    if grep -q "^PermitRootLogin no" /etc/ssh/sshd_config; then
        log_success "Root login is disabled"
    else
        log_warning "Root login might not be disabled"
    fi

    if grep -q "^PasswordAuthentication no" /etc/ssh/sshd_config; then
        log_success "Password authentication is disabled"
    else
        log_warning "Password authentication might not be disabled"
    fi

    log_success "Setup verification complete!"
}

show_usage() {
    cat <<EOF
VPS SSH Setup Helper Script

USAGE: bash $0 <command>

COMMANDS:
  create-user    Create claude-deploy user and .ssh directory
  add-pubkey     Add SSH public key to authorized_keys
  harden-ssh     Harden SSH security (disable root login, etc.)
  setup-all      Run all setup steps
  verify         Verify that setup is correct

EXAMPLES:

1. Complete setup (run all steps):
   bash $0 setup-all

2. Create user only:
   bash $0 create-user

3. Add your public key:
   SSH_PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1..." bash $0 add-pubkey

4. Verify setup was successful:
   bash $0 verify

DETAILED USAGE:

Step 1: Create the user and directory
  $ bash $0 create-user

Step 2: Add your public key
  $ SSH_PUBLIC_KEY="$(cat ~/.ssh/id_claude_vps.pub)" bash $0 add-pubkey

Step 3: Harden SSH (optional but recommended)
  $ bash $0 harden-ssh

Step 4: Verify everything is set up correctly
  $ bash $0 verify

EOF
}

# Main execution
main() {
    check_root

    case "${1:-setup-all}" in
        create-user)
            create_claude_user
            ;;
        add-pubkey)
            add_public_key
            ;;
        harden-ssh)
            harden_ssh
            ;;
        setup-all)
            log_info "Running complete VPS SSH setup..."
            create_claude_user
            log_warning "Please run step 2 to add your public key:"
            log_warning "  SSH_PUBLIC_KEY='$(cat ~/.ssh/id_claude_vps.pub)' bash $0 add-pubkey"
            ;;
        verify)
            verify_setup
            ;;
        help|-h|--help)
            show_usage
            ;;
        *)
            log_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
