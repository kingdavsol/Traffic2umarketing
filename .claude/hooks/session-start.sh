#!/bin/bash
# SessionStart Hook: Auto-Proceed Enforcement Protocol
# Runs at session start to configure environment for autonomous operations
# This hook ensures standing orders can be enforced without interruption

set -euo pipefail

# Signal async mode to prevent session start delay
echo '{"async": false}'

# ============================================================================
# ENVIRONMENT CONFIGURATION - Non-Interactive Mode
# ============================================================================

# Configure npm to never prompt
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false
export NPM_CONFIG_LOGLEVEL=error

# Configure Node to suppress warnings
export NODE_NO_WARNINGS=1

# Disable all interactive prompts
export TERM=dumb
export CI=true
export CI_ENVIRONMENT=true

# Configure git for automation
git config --global core.autocrlf false
git config --global core.safecrlf false

# Enable auto-proceed for Claude Code operations
export CLAUDE_AUTO_PROCEED=true
export CLAUDE_PERMIT_ALL=true
export CLAUDE_SKIP_CONFIRMATION=true
export CLAUDE_NO_INTERACTIVE=true

# Persist environment for session
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  cat >> "$CLAUDE_ENV_FILE" << 'EOE'
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false
export NPM_CONFIG_LOGLEVEL=error
export NODE_NO_WARNINGS=1
export TERM=dumb
export CI=true
export CI_ENVIRONMENT=true
export CLAUDE_AUTO_PROCEED=true
export CLAUDE_PERMIT_ALL=true
export CLAUDE_SKIP_CONFIRMATION=true
export CLAUDE_NO_INTERACTIVE=true
EOE
fi

# ============================================================================
# DEPENDENCY INSTALLATION
# ============================================================================

cd "${CLAUDE_PROJECT_DIR:-.}"

# Check if node_modules exists and is complete
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
  echo "[SessionStart] Installing npm dependencies..."
  npm install --legacy-peer-deps --ignore-scripts 2>&1 | tail -3
  echo "[SessionStart] Dependencies installed ✓"
fi

# ============================================================================
# PRISMA CLIENT GENERATION (if DATABASE_URL available)
# ============================================================================

if grep -q "@prisma/client" package.json 2>/dev/null; then
  if [ -n "${DATABASE_URL:-}" ] || [ -f ".env" ]; then
    echo "[SessionStart] Generating Prisma client..."
    if npx prisma generate 2>/dev/null; then
      echo "[SessionStart] Prisma client generated ✓"
    else
      echo "[SessionStart] Prisma generation skipped (will retry on next run with DB connection)"
    fi
  fi
fi

# ============================================================================
# TOOLING VALIDATION
# ============================================================================

# Verify linter is available (required for enforcement)
if ! npm run lint --version >/dev/null 2>&1; then
  echo "[SessionStart] ⚠ Linter not found, skipping validation"
else
  echo "[SessionStart] Linter available ✓"
fi

# Verify git is configured
if [ -z "$(git config --global user.email)" ]; then
  git config --global user.email "claude@traffic2u.local"
  git config --global user.name "Claude Code"
fi

# ============================================================================
# ENFORCEMENT HOOKS VALIDATION
# ============================================================================

# Verify enforcement hooks are in place
HOOKS_CHECK=0
for hook in enforce-git-safety.sh enforce-github-first.sh enforce-auto-proceed.sh; do
  if [ ! -f ".claude/hooks/$hook" ]; then
    echo "[SessionStart] ⚠ Missing enforcement hook: $hook"
    ((HOOKS_CHECK++))
  fi
done

if [ $HOOKS_CHECK -eq 0 ]; then
  echo "[SessionStart] All enforcement hooks present ✓"
fi

# Verify settings.json is configured
if [ ! -f ".claude/settings.json" ]; then
  echo "[SessionStart] ⚠ Missing .claude/settings.json"
else
  echo "[SessionStart] Settings configured ✓"
fi

# ============================================================================
# SESSION READY
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                                                                    ║"
echo "║  SESSION STARTED - AUTO-PROCEED ENFORCEMENT PROTOCOL ACTIVE       ║"
echo "║                                                                    ║"
echo "║  Standing Orders Enforced:                                        ║"
echo "║  ✓ All git operations auto-proceed (with safety checks)           ║"
echo "║  ✓ GitHub-first workflow enforced                                 ║"
echo "║  ✓ Dependencies installed and ready                               ║"
echo "║  ✓ Non-interactive mode enabled                                   ║"
echo "║                                                                    ║"
echo "║  Claude Code will proceed autonomously without confirmation.     ║"
echo "║  Review standing orders in CLAUDE.md if needed.                   ║"
echo "║                                                                    ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

exit 0
