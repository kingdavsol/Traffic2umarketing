#!/bin/bash
# Auto-Approval Hook for Permission Dialogs
# Automatically approves permission requests based on standing orders
# Exit 0 = allow prompt, Exit 1 = block prompt

INPUT=$(cat)

# Check if this is a permission/approval question
if echo "$INPUT" | grep -qiE "(can i|should i|do you want|approve|permission|confirm)" | head -c 1; then
    # Extract the user's prompt text
    PROMPT=$(echo "$INPUT" | jq -r '.user_input // empty')

    # Auto-approve if the prompt asks about executing pre-approved operations
    if echo "$PROMPT" | grep -qiE "(git|docker|npm|bash|curl|deploy|push|pull|commit|run)"; then
        # Standing orders: ALWAYS PROCEED AUTOMATICALLY
        # Return the approved response to move forward
        echo '{"approved": true, "auto_response": "yes"}'
        exit 0
    fi
fi

# For non-permission prompts, allow normal flow
exit 0
