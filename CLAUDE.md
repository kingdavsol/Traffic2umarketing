# Claude Code - Permanent Standing Orders

**CRITICAL: READ THIS FIRST ON EVERY SESSION**

## Auto-Proceed Policy - NEVER ASK FOR CONFIRMATION

Claude Code shall **ALWAYS PROCEED AUTOMATICALLY** without stopping to ask for user confirmation on:

### Git Operations (Always Execute)
- git add
- git commit
- git push
- git pull
- git checkout
- git branch
- git merge
- git clone
- Creating/switching branches
- Committing with descriptive messages
- Pushing to any branch on GitHub

### Docker Operations (Always Execute)
- docker build
- docker run
- docker stop
- docker rm
- docker-compose up/down
- docker restart
- docker ps
- docker logs
- Rebuilding containers
- Removing old containers/images

### VPS/SSH Operations (Always Execute)
- All SSH commands via ssh-mcp
- Deploying code to VPS
- Restarting services
- Installing dependencies
- Updating configurations
- Running deployment scripts
- Checking logs
- Testing endpoints

### File Operations (Always Execute)
- Reading any file anywhere
- Writing/editing code files
- Creating new files
- Deleting files (when necessary)
- Moving/renaming files
- Accessing any directory

### Deployment Workflow (Always Execute Automatically)
**CRITICAL**: ALWAYS use GitHub-first workflow:
1. Automatically commit with descriptive message
2. Automatically push to GitHub (current/appropriate branch)
3. Automatically SSH to VPS
4. Automatically pull latest code FROM GITHUB
5. Automatically rebuild/restart Docker containers
6. Automatically verify services are healthy
7. Automatically test affected endpoints
8. Report results to user

**NEVER** write code directly to VPS files - ALWAYS push to GitHub first, then pull

## Never Stop To Ask About:
- "Should I commit these changes?"
- "Should I push to GitHub?"
- "Should I restart the container?"
- "Should I deploy to VPS?"
- "Can I access this file?"
- "Is it okay to rebuild?"

## VPS Access Details
- **Server**: 72.60.114.234 (via ssh-mcp or direct SSH)
- **Web root**: /var/www/
- **Apps**: Each in /var/www/[appname]/
- **User**: root (via ssh-mcp tool)

## SSH Session Handling
- **CRITICAL**: ALWAYS use `mcp__ssh-mcp__exec` tool for ALL SSH operations
- The mcp__ssh-mcp__exec tool handles authentication automatically
- Use ONE long SSH session for multiple commands
- Combine commands with && or ; or use heredoc << 'EOF'
- NEVER make multiple separate SSH calls
- Example: Combine `cd /var/www/app && git pull && docker-compose up -d`

## Standard Deployment Commands
```bash
# Full deploy (run automatically)
cd /var/www/[app-name]
git pull origin [branch]
docker-compose down
docker-compose up -d --build

# OR for individual services
docker stop [container]
docker rm [container]
docker build -t [image] .
docker run -d [options] [image]

# Always check health after
docker ps -a
docker logs [container] --tail=50
curl -I https://[domain]
```

## Git Workflow (Execute Automatically)
```bash
# After any code changes (do automatically)
git add -A
git commit -m "[type]: [descriptive message]"
git push origin [current-branch]

# If new branch needed
git checkout -b [branch-name]
git push -u origin [branch-name]
```

## Error Handling
- If operation fails, retry once
- If still fails, try alternative approach
- Only ask user if all approaches exhausted
- Document what was tried

## Reporting Style
- Report what you DID, not what you WILL do
- Use past tense: "Deployed to VPS" not "Deploying to VPS"
- Show verification: "Container healthy"
- Brief status updates during long operations

## Multi-tasking
- Run independent operations in parallel
- Use background processes when appropriate
- Don't wait unnecessarily

## Traffic2umarketing Portfolio
- **Total Apps**: 72 applications
- **Branches**: 25+ branches
- **Tech Stack**: Next.js, React Native, Express, PostgreSQL, SQLite, MongoDB
- **Deployment**: Systematic approach needed
- **See**: TRAFFIC2U_DEPLOYMENT_HANDOFF_2025-12-01_1900.md

---

**REMEMBER**: The user wants ACTION, not questions. Execute first, report results, ask only if truly blocked.
