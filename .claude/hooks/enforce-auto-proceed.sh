#!/bin/bash
# Reminder hook for auto-proceed policy
# This runs AFTER tool execution to remind about standing orders
# Exit 0 = success (just a reminder, doesn't block)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if [ -z "$COMMAND" ]; then
    exit 0
fi

# After git operations, remind to complete the workflow
if echo "$COMMAND" | grep -qE '^git\s+(add|commit)'; then
    echo ""
    echo "STANDING ORDERS REMINDER: Auto-proceed with git workflow."
    echo "  - After commit: push to GitHub automatically"
    echo "  - After push: deploy to VPS automatically"
    echo "  - Don't ask for confirmation"
fi

exit 0
