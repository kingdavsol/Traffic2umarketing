# MCP SSH Server Setup Guide

This guide will help you set up the MCP SSH server to allow Claude Code to directly access your VPS.

## What This Enables

Once configured, I'll be able to:
- Execute commands directly on your VPS
- Read logs in real-time
- Monitor Docker containers
- Check deployment status
- Debug issues without you needing to copy-paste output

## Prerequisites

You need SSH key authentication set up between your local machine (where Claude Code runs) and your VPS.

## Step 1: Set Up SSH Key Authentication

### Option A: If you already have an SSH key

Check if you have an SSH key:
```bash
ls -la ~/.ssh/id_rsa*
```

If you see `id_rsa` and `id_rsa.pub`, you already have a key. Skip to Step 2.

### Option B: Create a new SSH key

```bash
# Generate a new SSH key
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Press Enter to accept default location (~/.ssh/id_rsa)
# Enter a passphrase (optional but recommended)
```

## Step 2: Copy SSH Key to VPS

```bash
# Copy your public key to the VPS
ssh-copy-id root@quicksell.monster

# Or manually copy it:
cat ~/.ssh/id_rsa.pub | ssh root@quicksell.monster "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## Step 3: Test SSH Connection

```bash
# Test that you can SSH without a password prompt
ssh root@quicksell.monster "echo 'SSH connection successful!'"
```

If this works without asking for a password, you're ready!

## Step 4: Restart Claude Code

The `.mcp.json` file has been created in your project root. Now you need to:

1. **Restart Claude Code completely** (close and reopen)
2. The MCP server will automatically load on startup

## Step 5: Verify MCP Server is Loaded

After restarting Claude Code, I should be able to see the MCP server. You can verify by asking me:

> "Can you check if the MCP SSH server is loaded?"

Or check manually:
```bash
# In your project directory
cat .mcp.json
```

## Alternative: Using SSH Password Authentication

If you prefer password authentication instead of SSH keys, modify `.mcp.json`:

```json
{
  "mcpServers": {
    "quicksell-vps": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "-y",
        "@idletoaster/ssh-mcp-server@latest"
      ],
      "env": {
        "SSH_HOST": "quicksell.monster",
        "SSH_USER": "root",
        "SSH_PORT": "22",
        "SSH_PASSWORD": "your-vps-password-here"
      }
    }
  }
}
```

**Warning:** Storing passwords in config files is less secure. SSH keys are recommended.

## Configuration Details

The `.mcp.json` file is configured for:
- **Host:** quicksell.monster
- **User:** root
- **Port:** 22
- **Auth:** SSH key at `~/.ssh/id_rsa`

If your setup is different, edit `.mcp.json` and change:
- `SSH_HOST`: Your VPS hostname or IP
- `SSH_USER`: Your SSH username
- `SSH_PORT`: SSH port (usually 22)
- `SSH_KEY_PATH`: Path to your private key

## Troubleshooting

### Issue: "Permission denied (publickey)"
**Fix:** Your SSH key isn't copied to the VPS. Run:
```bash
ssh-copy-id root@quicksell.monster
```

### Issue: MCP server not loading
**Fix:**
1. Check `.mcp.json` syntax is valid JSON
2. Restart Claude Code completely
3. Check SSH connection works manually: `ssh root@quicksell.monster`

### Issue: SSH key has a passphrase
**Fix:** You can either:
1. Add the key to ssh-agent:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/id_rsa
   ```
2. Or use a key without a passphrase for automation

## Testing the Connection

Once set up, ask me to:
- "Check the disk space on the VPS"
- "Show running Docker containers"
- "Display the contents of /var/www/quicksell.monster"
- "Run the monitor.sh script on the VPS"

I'll be able to execute these commands directly without you needing to copy-paste!

## What Happens Next

After this setup:
1. You push code to GitHub
2. I can directly run `git pull` on your VPS
3. I can rebuild Docker containers
4. I can check logs in real-time
5. I can run diagnostics and fix issues immediately

**No more back-and-forth copy-pasting!**

## Security Notes

- SSH keys are more secure than passwords
- Never commit `.mcp.json` with passwords to git
- The `.mcp.json` file in your repo uses `${HOME}/.ssh/id_rsa` which reads from your local machine
- Your private key never leaves your computer

## Next Steps

1. ✅ Set up SSH key authentication (above)
2. ✅ `.mcp.json` is already created
3. 🔲 Restart Claude Code
4. 🔲 Test the connection by asking me to run a command

Once you've completed steps 1-3, let me know and I'll test the VPS connection!
