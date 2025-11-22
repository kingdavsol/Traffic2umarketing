# Claude Code + Hostinger VPS SSH MCP Setup - QUICK START

**Objective**: Get Claude Code executing commands on your Hostinger VPS in ~1 hour
**Current Status**: Ready to implement
**Difficulty**: Intermediate (but all steps are clearly documented)

---

## WHAT YOU'RE SETTING UP

After completing this guide, Claude Code will be able to:

```
Claude Code (Local)
    ↓ (MCP SSH connection)
Hostinger VPS (SSH secured)
    ↓ (execute directly)
Deploy apps, check status, view logs, manage databases, etc.
```

### Real Example Commands You'll Be Able to Run:

```
"Deploy CaptionGenius app to the VPS"
→ Claude deploys the full app

"Check if all apps are running on the VPS"
→ Claude runs pm2 list and shows status

"Show me the last 50 lines of error logs"
→ Claude tails the log file and displays

"Create a PostgreSQL database for the insurance apps"
→ Claude creates it directly

"Restart the dashboard app"
→ Claude SSH's to VPS and restarts it
```

---

## 5-MINUTE OVERVIEW

### What Gets Created:

1. **claude-deploy user** on VPS (dedicated deployment user)
2. **SSH key pair** locally (id_claude_vps)
3. **MCP SSH server** (connects Claude to VPS)
4. **Configuration** (~/.claude/mcp.json)

### How It Works:

```
Step 1: You generate SSH key locally
Step 2: Add public key to VPS
Step 3: Install MCP SSH server locally
Step 4: Configure Claude Code with SSH settings
Step 5: Verify connection works
DONE! → Claude has VPS access
```

---

## THE 4 KEY FILES

| File | Purpose | Where | Size |
|------|---------|-------|------|
| **MCP_SSH_SETUP_GUIDE.md** | Step-by-step instructions | This repo | 15 KB |
| **mcp.json.template** | Config template | This repo | 1 KB |
| **VPS_SSH_SETUP.sh** | Automated VPS setup | This repo | 10 KB |
| **TEST_MCP_SSH_CONNECTION.sh** | Verification script | This repo | 8 KB |
| **DOMAINS_AND_SUBDOMAINS.md** | All 69 domains listed | This repo | 8 KB |

---

## STEP-BY-STEP QUICK START

### ⏱️ Total Time: ~1 hour

#### **Phase 1: Get Information (5 minutes)**

```bash
# Find your Hostinger VPS IP address
# → Login to Hostinger hPanel
# → Find VPS IP (e.g., 185.145.130.45)
# → Note it down

VPS_IP="YOUR_VPS_IP_HERE"
LOCAL_USERNAME="your_local_username"  # e.g., "user"
```

#### **Phase 2: VPS Setup (20 minutes)**

```bash
# 1. SSH to your VPS
ssh root@$VPS_IP

# 2. Download and run setup script
curl -O https://raw.githubusercontent.com/yourrepo/VPS_SSH_SETUP.sh
bash VPS_SSH_SETUP.sh create-user

# 3. In your LOCAL terminal, copy your public key
cat ~/.ssh/id_claude_vps.pub

# 4. Back in VPS terminal, add public key
SSH_PUBLIC_KEY="paste_your_key_here" bash VPS_SSH_SETUP.sh add-pubkey

# 5. Harden SSH (recommended)
bash VPS_SSH_SETUP.sh harden-ssh

# 6. Verify setup
bash VPS_SSH_SETUP.sh verify

# 7. Close VPS terminal
exit
```

#### **Phase 3: Local Setup (20 minutes)**

```bash
# 1. Generate SSH key (if not already done)
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -N ""

# 2. Create Claude Code config directory
mkdir -p ~/.claude

# 3. Copy template to config file
cp mcp.json.template ~/.claude/mcp.json

# 4. Edit the config file
nano ~/.claude/mcp.json

# 5. Update these values:
#    - "SSH_HOST": "YOUR_VPS_IP"  (e.g., "185.145.130.45")
#    - "SSH_PRIVATE_KEY_PATH": "/home/YOUR_USERNAME/.ssh/id_claude_vps"

# 6. Save and exit (Ctrl+O, Enter, Ctrl+X)

# 7. Set proper permissions
chmod 600 ~/.claude/mcp.json
```

#### **Phase 4: Verify Connection (15 minutes)**

```bash
# 1. Test SSH manually
ssh -i ~/.ssh/id_claude_vps claude-deploy@$VPS_IP "whoami"
# Should output: claude-deploy

# 2. Run verification script
bash TEST_MCP_SSH_CONNECTION.sh
# Will test everything and confirm setup

# 3. Restart Claude Code
# Close and reopen Claude Code application

# 4. Test in Claude Code
# Type: "Run whoami on the VPS via SSH"
# Claude should respond: "claude-deploy"
```

#### **Phase 5: Ready to Deploy! (Ongoing)**

```bash
# Now you can ask Claude:
"Deploy the CaptionGenius app from branch claude/ai-caption-generator-app"
"Check if apps are running: pm2 list"
"Create PostgreSQL database for insurance apps"
"Show me the dashboard logs"
"Restart the dashboard service"
```

---

## BEFORE YOU START: CHECKLIST

- [ ] Have Hostinger VPS login credentials
- [ ] Know your VPS IP address
- [ ] Have root SSH access to VPS
- [ ] Claude Code installed on local machine
- [ ] Node.js 18+ installed locally
- [ ] npm installed locally
- [ ] Basic SSH knowledge

---

## VERY DETAILED STEP-BY-STEP

If you want maximum detail, follow: **MCP_SSH_SETUP_GUIDE.md**

That file has:
- Detailed explanation of every step
- Expected outputs
- Troubleshooting for each step
- Security best practices
- Advanced configuration options

---

## COMMON QUESTIONS

### Q: Do I need to pay for anything?
**A**: No! SSH is free. MCP server is free. VPS you already have.

### Q: How secure is this?
**A**: Very secure. Uses ED25519 keys (military-grade), key-based auth only, password auth disabled.

### Q: What if something breaks?
**A**: See Troubleshooting section in MCP_SSH_SETUP_GUIDE.md. Or just regenerate the SSH key and try again.

### Q: Can I use multiple VPS servers?
**A**: Yes! Add multiple entries to ~/.claude/mcp.json (see Part 6 of MCP_SSH_SETUP_GUIDE.md)

### Q: Do I need to redo this if I restart Claude Code?
**A**: No, Claude Code remembers the configuration. Just restart Claude normally.

### Q: Can I revoke Claude's access?
**A**: Yes, delete the public key from ~/.ssh/authorized_keys on VPS and Claude can't connect anymore.

---

## COMMON ISSUES & QUICK FIXES

| Problem | Quick Fix |
|---------|-----------|
| "Permission denied (publickey)" | Public key not on VPS. See Part 2, Step 2.3 of guide |
| MCP server won't start | Install it: `npm install -g @modelcontextprotocol/server-ssh` |
| SSH times out | Check VPS IP is correct in mcp.json |
| Claude can't find MCP | Restart Claude Code after editing mcp.json |
| SSH key permission error | Run: `chmod 600 ~/.ssh/id_claude_vps` |

See full troubleshooting: MCP_SSH_SETUP_GUIDE.md → Troubleshooting section

---

## WHAT ABOUT DOMAINS?

Separate from MCP SSH setup, you also need to configure domains.

See: **DOMAINS_AND_SUBDOMAINS.md**

This file contains:
- All 69 domains to configure in Hostinger DNS
- Easiest method (4 DNS records with wildcard)
- Complete list (if you prefer individual records)
- SSL certificate setup
- Testing procedures

---

## AFTER SETUP: DEPLOY YOUR FIRST APP

Once SSH is working, try deploying an app:

```
In Claude Code, ask:

"Please deploy the CaptionGenius application.
From branch: claude/ai-caption-generator-app-01Wy8LNC4ojprjMW5s8G2ing
To VPS directory: /var/www/traffic2u.com/caption-genius
Steps:
1. Clone the branch
2. npm install
3. npm run build
4. Create .env file
5. Start with PM2
6. Verify it's running
7. Test the domain works"
```

Claude will do all of that automatically via SSH MCP!

---

## DEPLOYMENT ARCHITECTURE

```
Your 70+ Apps
    ↓
    ├─→ Deployed to /var/www/traffic2u.com/[app-name]/
    │
    ├─→ Running on ports 3000, 5000, etc.
    │
    ├─→ Managed by PM2 (process manager)
    │
    ├─→ Behind Nginx reverse proxy
    │
    └─→ Accessed via traffic2u.com/[subdomain]
                        or
                    quicksell.monster
```

---

## RECOMMENDED NEXT STEPS

### If You Want to Deploy ALL Apps at Once:

1. ✅ Complete this MCP setup (1 hour)
2. Run DEPLOYMENT_SETUP_SCRIPTS.sh on VPS (1.5 hours)
   - Installs: Node.js, Docker, Nginx, PostgreSQL, Redis, PM2
3. Configure domains in Hostinger DNS (30 min)
4. Deploy apps in 3 batches (2 weeks)
   - Batch 1: 8 simple apps (6-8 hours)
   - Batch 2: 30 mobile apps (12-16 hours)
   - Batch 3: 10 complex apps (8-12 hours)

See: IMPLEMENTATION_CHECKLIST.md for full timeline

### If You Want to Deploy Just One App to Test:

1. ✅ Complete this MCP setup (1 hour)
2. Run VPS setup script (1 hour)
3. Test with one app (1-2 hours)
4. Fix any issues
5. Then deploy remaining 69 apps

---

## FILE LOCATIONS IN THIS REPO

```
.
├── MCP_SSH_SETUP_GUIDE.md          ← Full detailed guide (START HERE)
├── MCP_SETUP_QUICK_START.md        ← This file (quick overview)
├── DOMAINS_AND_SUBDOMAINS.md       ← All 69 domains listed
├── mcp.json.template               ← Config template to customize
├── VPS_SSH_SETUP.sh                ← Automated VPS setup script
├── TEST_MCP_SSH_CONNECTION.sh      ← Verification script
├── DEPLOYMENT_SETUP_SCRIPTS.sh     ← Full VPS setup (separate)
├── IMPLEMENTATION_CHECKLIST.md     ← Full 2-week deployment plan
├── VPS_DEPLOYMENT_PLAN.md          ← Complete architecture document
└── ... (other docs)
```

---

## DECISION TREE: Which File Do I Read?

```
START HERE:
│
├─ "I want quick overview"
│  → Read this file (you are here!)
│
├─ "I want detailed step-by-step"
│  → Read MCP_SSH_SETUP_GUIDE.md
│
├─ "I just want to set it up"
│  → Copy mcp.json.template, run scripts, verify
│
├─ "I need to configure domains"
│  → Read DOMAINS_AND_SUBDOMAINS.md
│
├─ "I want to deploy all 70+ apps"
│  → Read IMPLEMENTATION_CHECKLIST.md
│
└─ "Something went wrong"
   → See Troubleshooting section in MCP_SSH_SETUP_GUIDE.md
```

---

## SUCCESS INDICATORS

### You'll know it's working when:

✅ SSH key generated locally
✅ claude-deploy user created on VPS
✅ SSH manual test works: `ssh -i ~/.ssh/id_claude_vps claude-deploy@VPS_IP whoami` returns `claude-deploy`
✅ MCP server installed: `npm list -g @modelcontextprotocol/server-ssh`
✅ ~/.claude/mcp.json configured
✅ Claude Code restarted
✅ In Claude Code: "Run whoami on VPS" returns `claude-deploy`
✅ You can run: "Check pm2 status on VPS"
✅ All VPS commands work from Claude Code

---

## SUMMARY TABLE

| Phase | Action | Time | File |
|-------|--------|------|------|
| 1 | Get VPS info | 5 min | (Check Hostinger) |
| 2 | VPS setup | 20 min | VPS_SSH_SETUP.sh |
| 3 | Local setup | 20 min | mcp.json.template |
| 4 | Verify | 15 min | TEST_MCP_SSH_CONNECTION.sh |
| **TOTAL** | **MCP Ready** | **~1 hour** | **✓** |

---

## COMMAND REFERENCE

### Generate SSH Key
```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -N ""
```

### Test SSH Connection
```bash
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "whoami"
```

### View MCP Configuration
```bash
cat ~/.claude/mcp.json
```

### Verify MCP Server Installed
```bash
npm list -g @modelcontextprotocol/server-ssh
```

### Run Verification Script
```bash
bash TEST_MCP_SSH_CONNECTION.sh
```

---

## NEXT: START WITH STEP 1

**Ready?** Open **MCP_SSH_SETUP_GUIDE.md** and follow Part 1, Step 1.1:

> Open terminal and SSH to VPS as root

---

**Setup Time**: ~1 hour
**Difficulty**: Intermediate
**Result**: Claude Code ↔ VPS SSH access
**Status**: ✅ Ready to implement

Good luck! 🚀
