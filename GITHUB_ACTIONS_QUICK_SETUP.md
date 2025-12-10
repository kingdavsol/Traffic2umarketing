# GitHub Actions - Quick Setup (5 Minutes)

**Status**: Workflow file is ready in `.github/workflows/deploy.yml`
**What you need to do**: Add SSH credentials to GitHub Secrets
**Time**: ~15 minutes total

---

## QUICK CHECKLIST

- [ ] VPS has `deploy-user` user created
- [ ] SSH key pair generated locally
- [ ] Public key added to VPS
- [ ] SSH connection tested manually
- [ ] GitHub Secrets added (VPS_HOST, VPS_SSH_KEY)
- [ ] Workflow tested with a branch push

---

## THE 4 COMMANDS YOU NEED

### 1. Create VPS deployment user (SSH to VPS as root)

```bash
useradd -m -s /bin/bash deploy-user
usermod -aG docker deploy-user
usermod -aG sudo deploy-user
mkdir -p /home/deploy-user/.ssh && chmod 700 /home/deploy-user/.ssh
echo "deploy-user ALL=(ALL) NOPASSWD:ALL" | tee /etc/sudoers.d/deploy-user
```

### 2. Generate SSH key (on your local machine)

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_github_vps -N "" -C "github-actions-vps"
cat ~/.ssh/id_github_vps.pub
# Copy the output
```

### 3. Add public key to VPS (SSH to VPS as root, then)

```bash
su - deploy-user
cat >> ~/.ssh/authorized_keys <<'EOF'
PASTE_YOUR_PUBLIC_KEY_HERE
EOF
chmod 600 ~/.ssh/authorized_keys
exit
exit
```

### 4. Test SSH (on your local machine)

```bash
ssh -i ~/.ssh/id_github_vps deploy-user@YOUR_VPS_IP "whoami"
# Should output: deploy-user
```

---

## ADD GITHUB SECRETS (5 minutes)

### In GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**

### Secret 1: VPS_HOST
- Name: `VPS_HOST`
- Value: `YOUR_VPS_IP` (e.g., `185.145.130.45`)

### Secret 2: VPS_SSH_KEY
- Name: `VPS_SSH_KEY`
- Value: (Contents of `~/.ssh/id_github_vps`)
  ```bash
  cat ~/.ssh/id_github_vps
  # Copy ENTIRE output (from -----BEGIN to -----END)
  ```

---

## TEST IT

### Push a test branch:

```bash
git push origin claude/test-deployment
```

### Watch it deploy:

1. Go to GitHub **Actions** tab
2. Click the running workflow
3. Watch deployment progress
4. See your app deployed to VPS!

---

## VERIFY ON VPS

```bash
ssh -i ~/.ssh/id_github_vps deploy-user@YOUR_VPS_IP
pm2 list
# You should see your deployed app!
```

---

## DONE! 🎉

Your GitHub Actions workflow is ready. Every push to a `claude/*` branch automatically deploys!

---

## NEXT: Deploy All 70+ Apps

Just push each branch:

```bash
# This will auto-deploy
git push origin claude/ai-caption-generator-app-01Wy8LNC4ojprjMW5s8G2ing
git push origin claude/datacash-monetization-01Y5zseebXjcC5Y62bi55kXG
git push origin claude/earnhub-student-01Y5zseebXjcC5Y62bi55kXG
# ... and so on
```

Each push = automatic deployment! ✓

---

For full details: See `GITHUB_ACTIONS_SETUP.md`
