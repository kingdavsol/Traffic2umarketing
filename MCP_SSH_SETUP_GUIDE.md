# Claude Code SSH MCP Server Setup Guide

**Objective**: Enable Claude Code to execute commands directly on Hostinger VPS via SSH MCP
**Estimated Setup Time**: 1 hour total
**Difficulty**: Intermediate
**Prerequisites**:
- Hostinger VPS with root/sudo access
- Local machine with Claude Code installed
- Basic SSH knowledge

---

## OVERVIEW

This guide enables Claude Code to access your Hostinger VPS using the MCP (Model Context Protocol) SSH server. Once configured, Claude can:

- Execute commands on the VPS in real-time
- View and edit files on the VPS
- Deploy applications
- Monitor processes
- Manage databases
- All with full interactive feedback

### Architecture

```
Local Machine (Claude Code)
         ↓
   MCP SSH Server (local)
         ↓
   SSH Connection (encrypted, key-based)
         ↓
Hostinger VPS (claude-deploy user)
         ↓
Execute commands, access files, deploy apps
```

---

## PART 1: VPS SIDE SETUP (15-20 minutes)

### Step 1.1: SSH into Your Hostinger VPS

```bash
# Open terminal and SSH to VPS
ssh root@YOUR_VPS_IP

# Example:
ssh root@185.145.130.45
```

You'll be prompted for the root password. Enter it.

### Step 1.2: Create the Claude Deployment User

```bash
# Create new user
useradd -m -s /bin/bash claude-deploy

# Set a password (optional, but recommended)
passwd claude-deploy
# Enter a strong password, confirm it

# Add to sudo group (for passwordless sudo)
usermod -aG sudo claude-deploy

# Add to docker group (for Docker commands without sudo)
usermod -aG docker claude-deploy
```

### Step 1.3: Setup SSH Directory for Claude User

```bash
# Create .ssh directory
mkdir -p /home/claude-deploy/.ssh

# Set proper permissions
chmod 700 /home/claude-deploy/.ssh

# Set ownership
chown -R claude-deploy:claude-deploy /home/claude-deploy/.ssh
```

### Step 1.4: Configure Sudo Without Password (Optional but Recommended)

This allows Claude to run privileged commands without a password:

```bash
# Edit sudoers file safely
visudo -f /etc/sudoers.d/claude-deploy

# Add this line:
claude-deploy ALL=(ALL) NOPASSWD:ALL

# Save and exit (Ctrl+X if using nano, :wq if using vi)
```

Verify it worked:
```bash
su - claude-deploy
sudo whoami
# Should output: root
# If error, your sudoers edit had an issue
```

### Step 1.5: Harden SSH Security (Recommended)

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Make these changes:
# - Find "PermitRootLogin yes" and change to:
PermitRootLogin no

# - Find "PasswordAuthentication yes" and change to:
PasswordAuthentication no

# Save: Ctrl+O, Enter, Ctrl+X

# Restart SSH service
sudo systemctl restart ssh

# Verify SSH still works in another terminal before closing this one!
```

### Step 1.6: Keep VPS Terminal Open

**Important**: Keep this SSH terminal to the VPS open. You'll need it in Step 2.

---

## PART 2: LOCAL MACHINE SETUP (20-30 minutes)

### Step 2.1: Generate SSH Key Pair

Open a **new terminal** on your local machine (not the VPS):

```bash
# Navigate to ssh directory
cd ~/.ssh

# Generate Ed25519 key (more secure than RSA)
ssh-keygen -t ed25519 -f id_claude_vps -C "claude-code-vps-deployment"

# When prompted for passphrase:
# Option A: Press Enter twice (no passphrase, easier but less secure)
# Option B: Enter a strong passphrase (more secure but requires entering passphrase)
#
# We recommend: No passphrase for development, passphrase for production
```

You should see output like:
```
Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/user/.ssh/id_claude_vps
Your public key has been saved in /home/user/.ssh/id_claude_vps.pub
```

### Step 2.2: View Your Public Key

```bash
# Display the public key content
cat ~/.ssh/id_claude_vps.pub

# Output will look like:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJx... claude-code-vps-deployment
```

**Copy the entire output to clipboard** - you'll need it in the next step.

### Step 2.3: Add Public Key to VPS

Return to the **VPS terminal** (still open from Part 1) and run:

```bash
# Switch to claude-deploy user
su - claude-deploy

# Add your public key
cat >> ~/.ssh/authorized_keys <<EOF
YOUR_PUBLIC_KEY_HERE
EOF

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys

# Verify it was added
cat ~/.ssh/authorized_keys
# Should show your ssh-ed25519 key
```

Replace `YOUR_PUBLIC_KEY_HERE` with the actual key you copied in Step 2.2.

**Example:**
```bash
cat >> ~/.ssh/authorized_keys <<EOF
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJx7vK4m2n9p0q1r2s3t4u5v6w7x8y9z0 claude-code-vps-deployment
EOF
```

### Step 2.4: Test SSH Connection from Local Machine

In your **local terminal** (not VPS), test the connection:

```bash
# Test SSH without password
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "whoami"

# Should output: claude-deploy

# If it fails, check:
# 1. VPS IP is correct
# 2. Public key was added correctly
# 3. File permissions are correct (chmod 700 ~/.ssh, chmod 600 authorized_keys)
```

**If successful**, you can proceed. **If it fails**, see Troubleshooting section at the end.

### Step 2.5: Create Alias for Convenience (Optional)

Add this to your local `~/.bash_aliases` or `~/.bashrc`:

```bash
# Add this line:
alias vps='ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP'

# Then reload:
source ~/.bashrc

# Now you can just type: vps
```

---

## PART 3: INSTALL MCP SSH SERVER (10 minutes)

### Step 3.1: Install Node.js (If Not Already Installed)

```bash
# Check if Node.js is installed
node --version

# If not installed, install it:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify:
node --version  # Should be 18+
npm --version   # Should be 9+
```

### Step 3.2: Install MCP SSH Server Globally

On your **local machine**:

```bash
# Install the MCP SSH server
npm install -g @modelcontextprotocol/server-ssh

# Verify installation
npm list -g @modelcontextprotocol/server-ssh

# Should show: @modelcontextprotocol/server-ssh@<version>
```

### Step 3.3: Verify MCP SSH Server Works

```bash
# Test the MCP server
which @modelcontextprotocol/server-ssh

# Or try to invoke it (should show help or error if not runnable)
npx @modelcontextprotocol/server-ssh --version
```

---

## PART 4: CONFIGURE CLAUDE CODE (15 minutes)

### Step 4.1: Find Claude Code Configuration Directory

Claude Code uses `~/.claude/` directory for configuration.

```bash
# Create the directory if it doesn't exist
mkdir -p ~/.claude

# Verify
ls -la ~/.claude/
```

### Step 4.2: Create or Edit MCP Configuration

Create `~/.claude/mcp.json`:

```bash
# Open editor (nano is easiest)
nano ~/.claude/mcp.json
```

Paste this content (modify YOUR_VPS_IP and YOUR_USERNAME):

```json
{
  "mcpServers": {
    "vps-ssh": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "YOUR_VPS_IP",
        "SSH_PORT": "22",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY_PATH": "/home/YOUR_USERNAME/.ssh/id_claude_vps",
        "SSH_PRIVATE_KEY_PASSPHRASE": ""
      }
    }
  }
}
```

**Replace:**
- `YOUR_VPS_IP`: Your Hostinger VPS IP (e.g., `185.145.130.45`)
- `YOUR_USERNAME`: Your local username (e.g., `user`)

**Example (filled in):**
```json
{
  "mcpServers": {
    "vps-ssh": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "185.145.130.45",
        "SSH_PORT": "22",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY_PATH": "/home/user/.ssh/id_claude_vps",
        "SSH_PRIVATE_KEY_PASSPHRASE": ""
      }
    }
  }
}
```

Save the file:
- If using **nano**: Ctrl+O, Enter, Ctrl+X
- If using **vi**: Escape, `:wq`, Enter

### Step 4.3: Set Proper File Permissions

```bash
# Make config file readable only by you (security best practice)
chmod 600 ~/.claude/mcp.json

# Verify
ls -la ~/.claude/mcp.json
# Should show: -rw------- (permissions 600)
```

---

## PART 5: VERIFY EVERYTHING WORKS (10 minutes)

### Step 5.1: Restart Claude Code

**Important**: Claude Code needs to restart to load the new MCP configuration.

- If Claude Code is open in a terminal, press Ctrl+C to stop it
- If using Claude Code IDE/GUI, close and reopen it

```bash
# Start Claude Code fresh (if running from terminal)
claude
```

### Step 5.2: Test MCP Connection

In Claude Code, type this command:

```
Run: whoami
on the VPS via SSH
```

Claude should respond with: `claude-deploy`

If Claude Code doesn't have access to MCP, it will say it doesn't understand. See Troubleshooting.

### Step 5.3: Test More Commands

Try these commands in Claude Code to verify everything works:

```
Command 1: Check VPS hostname
Run: hostname
on the VPS

Expected response: Your VPS hostname

---

Command 2: Check available storage
Run: df -h
on the VPS

Expected response: Disk usage table

---

Command 3: Check Node.js version
Run: node --version
on the VPS

Expected response: v18.x.x (or higher)

---

Command 4: List apps directory
Run: ls -la /var/www/
on the VPS

Expected response: Directory listing (may be empty initially)
```

### Step 5.4: Test File Operations

```
Command: View /etc/hostname
on the VPS
```

Claude should be able to read and display the VPS hostname file.

---

## PART 6: ADVANCED CONFIGURATION (Optional)

### Option 6.1: Use SSH Agent (If Using Passphrase)

If your SSH key has a passphrase, use `ssh-agent` to avoid typing it repeatedly:

```bash
# Start ssh-agent
eval $(ssh-agent -s)

# Add your key
ssh-add ~/.ssh/id_claude_vps

# Enter passphrase when prompted (only once per session)

# Verify
ssh-add -l
# Should show: ... id_claude_vps ...
```

### Option 6.2: Configure Multiple VPS Servers

If you have multiple VPS servers, add them to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "vps-ssh-production": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "prod-vps-ip.hostinger.com",
        "SSH_PORT": "22",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY_PATH": "/home/YOUR_USERNAME/.ssh/id_claude_vps",
        "SSH_PRIVATE_KEY_PASSPHRASE": ""
      }
    },
    "vps-ssh-staging": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-ssh"],
      "env": {
        "SSH_HOST": "staging-vps-ip.hostinger.com",
        "SSH_PORT": "22",
        "SSH_USER": "claude-deploy",
        "SSH_PRIVATE_KEY_PATH": "/home/YOUR_USERNAME/.ssh/id_claude_vps",
        "SSH_PRIVATE_KEY_PASSPHRASE": ""
      }
    }
  }
}
```

Then in Claude Code:
```
Run: whoami
on the production VPS via SSH

Run: whoami
on the staging VPS via SSH
```

### Option 6.3: Use Passphrase in Configuration (Not Recommended)

If you want Claude Code to handle the passphrase automatically (less secure):

```json
"SSH_PRIVATE_KEY_PASSPHRASE": "your-passphrase-here"
```

**⚠️ Security Warning**: This stores your passphrase in plain text. Only use for development environments. Use SSH agent in production.

---

## TROUBLESHOOTING

### Problem: "Permission denied (publickey)"

**Cause**: Public key not properly added or SSH permissions are wrong.

**Solution**:
```bash
# 1. Verify public key is on VPS
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "cat ~/.ssh/authorized_keys"

# 2. Check file permissions on VPS
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "ls -la ~/.ssh/authorized_keys"
# Should show: -rw------- 1 claude-deploy claude-deploy

# 3. If wrong permissions, fix them:
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "chmod 600 ~/.ssh/authorized_keys"

# 4. If key not in file, re-add it:
cat ~/.ssh/id_claude_vps.pub | ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"
```

### Problem: "Could not resolve hostname"

**Cause**: Wrong VPS IP or hostname in MCP configuration.

**Solution**:
```bash
# 1. Verify VPS IP
# Check your Hostinger control panel for the correct IP

# 2. Update ~/.claude/mcp.json
nano ~/.claude/mcp.json

# 3. Change SSH_HOST to correct IP

# 4. Restart Claude Code
```

### Problem: MCP Server Won't Start

**Cause**: MCP server not installed or not in PATH.

**Solution**:
```bash
# 1. Verify MCP server is installed
npm list -g @modelcontextprotocol/server-ssh

# 2. If not installed, install it:
npm install -g @modelcontextprotocol/server-ssh

# 3. Verify Node.js is accessible
which node
which npm

# 4. Try to run MCP manually
npx @modelcontextprotocol/server-ssh --help

# 5. Restart Claude Code
```

### Problem: Claude Code Shows "MCP not available"

**Cause**: Configuration file not found or MCP server not configured.

**Solution**:
```bash
# 1. Verify config file exists
cat ~/.claude/mcp.json

# 2. Verify file has correct JSON format
# (no trailing commas, all quotes matched)

# 3. Verify SSH key exists
ls -la ~/.ssh/id_claude_vps

# 4. Kill any running Claude Code processes
pkill -f "claude"

# 5. Start Claude Code fresh
claude
```

### Problem: "SSH Key File Not Found"

**Cause**: Path to SSH key is incorrect in MCP configuration.

**Solution**:
```bash
# 1. Find your SSH key location
ls -la ~/.ssh/id_claude_vps

# 2. Update mcp.json with correct path
# It should be the FULL absolute path, not ~
# Correct: /home/username/.ssh/id_claude_vps
# Incorrect: ~/.ssh/id_claude_vps

# 3. Verify Claude Code sees correct path
cat ~/.claude/mcp.json | grep SSH_PRIVATE_KEY_PATH
```

### Problem: Commands Timeout or Hang

**Cause**: Network connectivity or SSH server unresponsive.

**Solution**:
```bash
# 1. Test SSH connection manually
ssh -i ~/.ssh/id_claude_vps -v claude-deploy@YOUR_VPS_IP

# 2. Check VPS is up
ping YOUR_VPS_IP

# 3. Check SSH service on VPS
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "sudo systemctl status ssh"

# 4. Restart SSH service if needed
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "sudo systemctl restart ssh"
```

---

## SECURITY BEST PRACTICES

### 1. SSH Key Management

```bash
# ✅ DO: Protect your private key
chmod 600 ~/.ssh/id_claude_vps

# ✅ DO: Keep private key backed up safely
# Copy to password manager or encrypted storage

# ✅ DO: Use strong passphrases if protecting keys
ssh-keygen -p -f ~/.ssh/id_claude_vps

# ❌ DON'T: Share or commit private key to Git
echo "~/.ssh/id_claude_vps" >> ~/.gitignore

# ❌ DON'T: Store passphrase in config files (for production)
```

### 2. VPS SSH Hardening

Already done in Step 1.5, but verify:

```bash
# Disable root login
grep "PermitRootLogin" /etc/ssh/sshd_config
# Should show: PermitRootLogin no

# Disable password auth
grep "PasswordAuthentication" /etc/ssh/sshd_config
# Should show: PasswordAuthentication no
```

### 3. Regular Key Rotation

```bash
# Every 3-6 months, generate new key:
ssh-keygen -t ed25519 -f id_claude_vps_new -C "claude-code-vps-$(date +%Y%m%d)"

# Add new public key to VPS authorized_keys
cat id_claude_vps_new.pub | ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "cat >> ~/.ssh/authorized_keys"

# Update ~/.claude/mcp.json to use new key
nano ~/.claude/mcp.json

# Test with new key
ssh -i ~/.ssh/id_claude_vps_new claude-deploy@YOUR_VPS_IP "whoami"

# Once verified, remove old key
rm ~/.ssh/id_claude_vps*
mv ~/.ssh/id_claude_vps_new ~/.ssh/id_claude_vps
```

### 4. Audit SSH Access

```bash
# Check SSH log on VPS
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "sudo tail -50 /var/log/auth.log"

# Look for failed login attempts
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "sudo grep -i 'failed' /var/log/auth.log | tail -10"
```

---

## NEXT STEPS

### After Successful Setup:

1. **Deploy First App**: Use Claude Code to deploy an app
   ```
   Deploy the CaptionGenius app to /var/www/traffic2u.com/caption-genius
   on the Hostinger VPS via SSH
   ```

2. **Setup Additional Infrastructure**:
   ```
   Run: sudo bash /root/DEPLOYMENT_SETUP_SCRIPTS.sh setup-vps
   on the VPS
   ```

3. **Create Domains**:
   ```
   Run: sudo bash /root/DEPLOYMENT_SETUP_SCRIPTS.sh setup-apps
   on the VPS
   ```

4. **Monitor Deployments**:
   ```
   Run: pm2 list
   on the VPS
   ```

---

## QUICK REFERENCE

### Test Connection
```bash
# Local machine
ssh -i ~/.ssh/id_claude_vps claude-deploy@YOUR_VPS_IP "whoami"
# Should output: claude-deploy
```

### Regenerate Keys
```bash
# If you lose keys or need new ones
ssh-keygen -t ed25519 -f ~/.ssh/id_claude_vps -N ""
# Then repeat Part 2, Step 2.3
```

### List MCP Configuration
```bash
# View current MCP config
cat ~/.claude/mcp.json
```

### Check MCP Server Logs
```bash
# If Claude Code provides logs
# Check ~/.claude/logs/ or Claude Code's console output
```

---

## SUMMARY

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1.1-1.6 | VPS setup | 15-20 min | ☐ |
| 2.1-2.5 | SSH keys | 20-30 min | ☐ |
| 3.1-3.3 | MCP install | 10 min | ☐ |
| 4.1-4.3 | Claude config | 15 min | ☐ |
| 5.1-5.4 | Verification | 10 min | ☐ |
| **TOTAL** | **Setup Complete** | **~1 hour** | ☐ |

Once complete, Claude Code has full SSH access to your Hostinger VPS!

---

**Date Prepared**: November 21, 2025
**Status**: Ready to Follow
**Questions?**: Check Troubleshooting section or review documentation
