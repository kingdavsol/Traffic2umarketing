#!/bin/bash
#===============================================================================
# POST-TOOL WORKFLOW REMINDER
#===============================================================================
# Runs AFTER tool execution to remind about completing the GitHub-first workflow.
# This ensures commits are followed by pushes, and pushes by VPS deployments.
#===============================================================================

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

if [ -z "$COMMAND" ]; then
    exit 0
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

#-------------------------------------------------------------------------------
# After git add: Remind to commit
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE '^git\s+add'; then
    echo ""
    echo "WORKFLOW: Files staged. Next step:"
    echo "  git commit -m 'type: descriptive message'"
fi

#-------------------------------------------------------------------------------
# After git commit: Remind to push
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE '^git\s+commit'; then
    echo ""
    echo "WORKFLOW: Commit complete. Next step:"
    echo "  git push origin $CURRENT_BRANCH"
    echo ""
    echo "Standing Orders: Auto-proceed - push immediately."
fi

#-------------------------------------------------------------------------------
# After git push: Remind to deploy to VPS
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE '^git\s+push'; then
    echo ""
    echo "WORKFLOW: Push complete. Deploy to VPS:"
    echo ""
    echo "  # Contabo (72.60.114.234):"
    echo "  ssh root@72.60.114.234 'cd /var/www/APP && git pull origin $CURRENT_BRANCH'"
    echo ""
    echo "  # With Docker:"
    echo "  ssh root@72.60.114.234 'cd /var/www/APP && git pull && docker-compose up -d --build'"
    echo ""
    echo "Standing Orders: Auto-proceed - deploy immediately."
fi

#-------------------------------------------------------------------------------
# After git pull: Confirm sync status
#-------------------------------------------------------------------------------
if echo "$COMMAND" | grep -qE '^git\s+pull'; then
    echo ""
    echo "WORKFLOW: Pull complete. Local is now synced with GitHub."
fi

exit 0
