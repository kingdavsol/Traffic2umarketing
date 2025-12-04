#!/bin/bash
# Enforce GitHub-first deployment workflow
# BLOCKS direct VPS file writes - must go through git
# Exit 1 = BLOCKED, Exit 0 = ALLOWED

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
    exit 0
fi

# BLOCK: Direct SSH commands that write/edit files on VPS
# Pattern: ssh commands containing echo/cat/sed/awk writing to /var/www
if echo "$COMMAND" | grep -qE "ssh.*'.*(\becho\b.*>|cat.*>|sed\s+-i|awk.*>).*/var/www"; then
    echo "BLOCKED: Direct file writes to VPS via SSH are prohibited."
    echo "Standing Orders: ALWAYS use GitHub-first workflow."
    echo "  1. Commit changes locally"
    echo "  2. Push to GitHub"
    echo "  3. SSH to VPS and git pull"
    exit 1
fi

# BLOCK: SCP/rsync directly to /var/www (bypassing git)
if echo "$COMMAND" | grep -qE '(scp|rsync)\s+.*\s+.*:/var/www'; then
    echo "BLOCKED: Direct file transfer to VPS /var/www is prohibited."
    echo "Standing Orders: ALWAYS use GitHub-first workflow."
    echo "  1. Commit changes locally"
    echo "  2. Push to GitHub"
    echo "  3. SSH to VPS and git pull"
    exit 1
fi

exit 0
