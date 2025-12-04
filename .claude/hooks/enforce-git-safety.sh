#!/bin/bash
# Enforce git safety rules from standing orders
# Exit 1 = BLOCKED, Exit 0 = ALLOWED

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
    exit 0
fi

# BLOCK: git push --force to main/master
if echo "$COMMAND" | grep -qE 'git\s+push\s+.*--force.*\s+(main|master)' || \
   echo "$COMMAND" | grep -qE 'git\s+push\s+-f\s+.*\s+(main|master)'; then
    echo "BLOCKED: Force push to main/master is prohibited."
    echo "Standing Orders: Never force push to protected branches."
    exit 1
fi

# BLOCK: git reset --hard on main/master without explicit user request
if echo "$COMMAND" | grep -qE 'git\s+reset\s+--hard'; then
    # Check if we're on main/master
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
    if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
        echo "BLOCKED: git reset --hard on main/master is prohibited."
        echo "Standing Orders: Protect main branch from destructive operations."
        exit 1
    fi
fi

# BLOCK: Deleting main/master branch
if echo "$COMMAND" | grep -qE 'git\s+branch\s+-[dD]\s+(main|master)'; then
    echo "BLOCKED: Deleting main/master branch is prohibited."
    exit 1
fi

exit 0
