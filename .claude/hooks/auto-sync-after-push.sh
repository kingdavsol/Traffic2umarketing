#!/bin/bash
# Auto-Sync Hook: Automatically pull after git push
# Prevents repository divergence by syncing local repo after push
# Exit 0 = success, Exit 1 = block operation

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
EXIT_CODE=$(echo "$INPUT" | jq -r '.exit_code // empty')

if [ -z "$COMMAND" ]; then
    exit 0
fi

# Check if this was a successful git push
if echo "$COMMAND" | grep -qE '^git\s+push' && [ "$EXIT_CODE" = "0" ]; then
    # Extract branch name from the push command
    BRANCH=$(echo "$COMMAND" | grep -oE 'origin\s+[^ ]+' | awk '{print $2}' || git branch --show-current)

    if [ -z "$BRANCH" ]; then
        BRANCH=$(git branch --show-current)
    fi

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 AUTO-SYNC: Git push detected. Syncing local repository..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Automatically pull to keep repos in sync
    if git pull origin "$BRANCH" 2>&1 | tail -5; then
        echo "✅ Repository synchronized: Local repo now matches GitHub"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    else
        echo "⚠️  Auto-pull encountered an issue (branch divergence or conflicts)"
        echo "    Manual resolution may be needed. Check git status."
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    fi
    echo ""
fi

exit 0
