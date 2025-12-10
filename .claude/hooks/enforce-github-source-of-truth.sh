#!/bin/bash
#===============================================================================
# GITHUB SOURCE OF TRUTH - MASTER ENFORCEMENT HOOK
#===============================================================================
# This hook ensures GitHub is ALWAYS the source of truth for all repositories.
# It prevents out-of-sync issues between local, GitHub, and VPS environments.
#
# INSTALL: Copy .claude/ directory to every repository root
#
# VPS SERVERS:
#   - Contabo:   72.60.114.234
#   - Hostinger: (configure IP below)
#   - Other:     (configure IP below)
#
# RULES ENFORCED:
#   1. Must pull from GitHub before making changes (sync check)
#   2. Must push to GitHub before deploying to VPS
#   3. Direct file writes to VPS are BLOCKED
#   4. Force push to main/master is BLOCKED
#   5. Destructive operations on main/master are BLOCKED
#===============================================================================

set -e

#-------------------------------------------------------------------------------
# CONFIGURATION - Update these for your environment
#-------------------------------------------------------------------------------
VPS_SERVERS=(
    "72.60.114.234"      # Contabo
    "your-hostinger-ip"  # Hostinger - UPDATE THIS
    "your-other-vps-ip"  # Other VPS - UPDATE THIS
)

VPS_WEB_ROOTS=(
    "/var/www"
    "/home"
    "/srv"
    "/opt"
)

PROTECTED_BRANCHES=(
    "main"
    "master"
    "production"
    "prod"
)

#-------------------------------------------------------------------------------
# PARSE INPUT
#-------------------------------------------------------------------------------
INPUT=$(cat)
TOOL_NAME="${1:-Bash}"
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Exit if no command
if [ -z "$COMMAND" ]; then
    exit 0
fi

#-------------------------------------------------------------------------------
# HELPER FUNCTIONS
#-------------------------------------------------------------------------------
log_block() {
    echo ""
    echo "=========================================="
    echo "BLOCKED: $1"
    echo "=========================================="
    echo "$2"
    echo ""
}

log_warn() {
    echo ""
    echo "WARNING: $1"
    echo ""
}

is_protected_branch() {
    local branch="$1"
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [ "$branch" = "$protected" ]; then
            return 0
        fi
    done
    return 1
}

is_vps_server() {
    local target="$1"
    for vps in "${VPS_SERVERS[@]}"; do
        if echo "$target" | grep -q "$vps"; then
            return 0
        fi
    done
    return 1
}

is_vps_path() {
    local path="$1"
    for root in "${VPS_WEB_ROOTS[@]}"; do
        if echo "$path" | grep -q "$root"; then
            return 0
        fi
    done
    return 1
}

check_sync_status() {
    # Fetch latest from remote (silently)
    git fetch origin 2>/dev/null || return 0

    local LOCAL=$(git rev-parse HEAD 2>/dev/null)
    local REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")

    # No upstream set
    if [ -z "$REMOTE" ]; then
        return 0
    fi

    local BASE=$(git merge-base HEAD @{u} 2>/dev/null || echo "")

    if [ "$LOCAL" = "$REMOTE" ]; then
        # Up to date
        return 0
    elif [ "$LOCAL" = "$BASE" ]; then
        # Local is BEHIND remote - need to pull
        return 1
    elif [ "$REMOTE" = "$BASE" ]; then
        # Local is AHEAD of remote - need to push
        return 2
    else
        # Diverged - need to pull and merge
        return 3
    fi
}

#-------------------------------------------------------------------------------
# RULE 1: SYNC CHECK BEFORE GIT COMMIT
# Prevents committing when local is behind remote
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE '^git\s+commit'; then
    check_sync_status
    SYNC_STATUS=$?

    if [ $SYNC_STATUS -eq 1 ]; then
        log_block "Local branch is BEHIND remote" \
"Your local branch is behind the remote. Pull first to avoid conflicts.

ACTION REQUIRED:
  git pull origin $(git branch --show-current 2>/dev/null || echo 'BRANCH')

Then retry your commit."
        exit 1
    elif [ $SYNC_STATUS -eq 3 ]; then
        log_warn "Local and remote have DIVERGED"
        echo "Consider pulling and merging before committing."
        echo "  git pull origin $(git branch --show-current 2>/dev/null || echo 'BRANCH')"
        # Don't block, just warn
    fi
fi

#-------------------------------------------------------------------------------
# RULE 2: BLOCK FORCE PUSH TO PROTECTED BRANCHES
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE 'git\s+push.*(-f|--force)'; then
    for branch in "${PROTECTED_BRANCHES[@]}"; do
        if echo "$COMMAND" | grep -qE "(origin\s+$branch|origin/$branch|\s+$branch$)"; then
            log_block "Force push to protected branch '$branch'" \
"Standing Orders: Never force push to protected branches.

Protected branches: ${PROTECTED_BRANCHES[*]}

If you MUST force push, the user must explicitly approve this action."
            exit 1
        fi
    done
fi

#-------------------------------------------------------------------------------
# RULE 3: BLOCK DESTRUCTIVE OPERATIONS ON PROTECTED BRANCHES
#-------------------------------------------------------------------------------
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

# Block: git reset --hard on protected branches
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
    if is_protected_branch "$CURRENT_BRANCH"; then
        log_block "git reset --hard on protected branch '$CURRENT_BRANCH'" \
"Standing Orders: Protect main/master from destructive operations.

You are on branch: $CURRENT_BRANCH
This operation would discard commits and is not reversible.

Switch to a feature branch first:
  git checkout -b feature/your-changes"
        exit 1
    fi
fi

# Block: Deleting protected branches
if echo "$COMMAND" | grep -qE 'git\s+branch\s+-[dD]'; then
    for branch in "${PROTECTED_BRANCHES[@]}"; do
        if echo "$COMMAND" | grep -qE "git\s+branch\s+-[dD]\s+$branch"; then
            log_block "Deleting protected branch '$branch'" \
"Standing Orders: Never delete protected branches.

Protected branches: ${PROTECTED_BRANCHES[*]}"
            exit 1
        fi
    done
fi

#-------------------------------------------------------------------------------
# RULE 4: BLOCK DIRECT FILE WRITES TO VPS
# All changes must go through GitHub first
#-------------------------------------------------------------------------------

# Pattern: SSH with file write operations
if echo "$COMMAND" | grep -qE '^ssh\s+'; then
    # Check if targeting a VPS
    if is_vps_server "$COMMAND"; then
        # Check for direct file write patterns
        if echo "$COMMAND" | grep -qE '(echo\s+.*>|cat\s+.*>|printf\s+.*>|tee\s+|sed\s+-i|awk\s+.*>|nano\s+|vim\s+|vi\s+)'; then
            if is_vps_path "$COMMAND"; then
                log_block "Direct file write to VPS detected" \
"Standing Orders: GitHub is the source of truth.
Direct file writes to VPS are prohibited.

CORRECT WORKFLOW:
  1. Make changes locally
  2. git add -A && git commit -m 'your message'
  3. git push origin $(git branch --show-current 2>/dev/null || echo 'BRANCH')
  4. SSH to VPS: cd /var/www/app && git pull origin BRANCH

This ensures all changes are tracked in version control."
                exit 1
            fi
        fi
    fi
fi

# Pattern: SCP to VPS
if echo "$COMMAND" | grep -qE '^scp\s+'; then
    for vps in "${VPS_SERVERS[@]}"; do
        if echo "$COMMAND" | grep -q "$vps"; then
            if is_vps_path "$COMMAND"; then
                log_block "SCP file transfer to VPS detected" \
"Standing Orders: GitHub is the source of truth.
Direct file transfers via SCP are prohibited.

CORRECT WORKFLOW:
  1. Commit files to git
  2. Push to GitHub
  3. Pull on VPS via SSH"
                exit 1
            fi
        fi
    done
fi

# Pattern: rsync to VPS
if echo "$COMMAND" | grep -qE '^rsync\s+'; then
    for vps in "${VPS_SERVERS[@]}"; do
        if echo "$COMMAND" | grep -q "$vps"; then
            if is_vps_path "$COMMAND"; then
                log_block "rsync to VPS detected" \
"Standing Orders: GitHub is the source of truth.
Direct file sync via rsync is prohibited.

CORRECT WORKFLOW:
  1. Commit files to git
  2. Push to GitHub
  3. Pull on VPS via SSH"
                exit 1
            fi
        fi
    done
fi

#-------------------------------------------------------------------------------
# RULE 5: WARN IF PUSHING WITHOUT RECENT PULL
# Helps catch potential merge conflicts early
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE '^git\s+push'; then
    # Check if we've fetched recently (within last 5 minutes)
    FETCH_HEAD=".git/FETCH_HEAD"
    if [ -f "$FETCH_HEAD" ]; then
        FETCH_AGE=$(($(date +%s) - $(stat -c %Y "$FETCH_HEAD" 2>/dev/null || stat -f %m "$FETCH_HEAD" 2>/dev/null || echo 0)))
        if [ $FETCH_AGE -gt 300 ]; then
            log_warn "Haven't fetched from remote in over 5 minutes"
            echo "Consider running 'git fetch origin' first to check for remote changes."
        fi
    fi
fi

#-------------------------------------------------------------------------------
# RULE 6: REMINDER AFTER SUCCESSFUL COMMIT
# (This part runs as PostToolUse - check tool result)
#-------------------------------------------------------------------------------
# This is handled by settings.json routing to this script with different context

#-------------------------------------------------------------------------------
# ALL CHECKS PASSED
#-------------------------------------------------------------------------------
exit 0
