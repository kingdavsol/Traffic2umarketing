# QuickSell Deployment Guide

## VPS Deployment Scripts

This repository includes three scripts to help with deployment and monitoring:

### 1. `deploy.sh` - Full Deployment
Complete deployment from GitHub with validation and health checks.

**Usage:**
```bash
sudo bash deploy.sh [branch-name]
```

**What it does:**
- Clones/updates repository from GitHub
- Validates .env configuration
- Checks Docker installation
- Builds and starts all services
- Runs comprehensive health checks
- Tests API endpoints

**When to use:**
- First-time deployment
- Major infrastructure changes
- When you need to reset the database
- After changing docker-compose or Dockerfile

---

### 2. `quick-deploy.sh` - Fast Updates
Pulls latest changes and rebuilds only what's needed.

**Usage:**
```bash
sudo bash quick-deploy.sh [branch-name]
```

**What it does:**
- Pulls latest code from GitHub
- Detects which services changed
- Rebuilds only affected services (backend, frontend, or both)
- Runs health checks on updated services

**When to use:**
- After pushing code changes to GitHub
- Quick iterative development
- When you know exactly what changed

**Smart Rebuilding:**
- If only backend files changed → rebuilds backend only
- If only frontend files changed → rebuilds frontend only
- If docker/config files changed → rebuilds everything

---

### 3. `monitor.sh` - Diagnostics & Monitoring
Comprehensive health check and diagnostics tool.

**Usage:**
```bash
bash monitor.sh
```

**What it shows:**
1. Container status (running/stopped/crashed)
2. Health checks (backend, frontend, DB, Redis)
3. Recent backend logs (last 30 lines)
4. Recent frontend logs (last 20 lines)
5. Database connection test
6. Environment variable validation
7. Docker network status
8. Disk space usage
9. API endpoint tests (/api/v1/auth/register, /api/v1/health)
10. Git repository info
11. Container resource usage (CPU, memory)

**When to use:**
- Troubleshooting deployment issues
- Checking if services are healthy
- Getting logs for debugging
- Verifying configuration

---

## Typical Workflow

### Initial Setup (First Time)
```bash
# On VPS
sudo bash deploy.sh
```

### Regular Development Cycle
```bash
# 1. Make changes locally and push to GitHub
git add .
git commit -m "Your changes"
git push -u origin claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1

# 2. On VPS - deploy the changes
sudo bash quick-deploy.sh

# 3. If something goes wrong, check diagnostics
bash monitor.sh
```

### Troubleshooting
```bash
# Get comprehensive diagnostics
bash monitor.sh

# View live logs
cd /var/www/quicksell.monster/quicksell
docker compose -f docker-compose.prod.yml logs -f

# View only backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# View only frontend logs
docker compose -f docker-compose.prod.yml logs -f frontend

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend

# Full restart
docker compose -f docker-compose.prod.yml restart
```

---

## Environment Setup

Before running any deployment, ensure `.env` file exists with proper values:

```bash
cd /var/www/quicksell.monster/quicksell

# Copy example if .env doesn't exist
cp .env.example .env

# Edit with your values
nano .env
```

**Required variables:**
- `DB_PASSWORD` - PostgreSQL password (must match across restarts)
- `REDIS_PASSWORD` - Redis password
- `JWT_SECRET` - Secret for JWT token signing

**Important Docker settings:**
- `DB_HOST=postgres` (not localhost)
- `REDIS_HOST=redis` (not localhost)
- `NODE_ENV=production`

---

## Common Issues

### Issue: Registration returns 404
**Cause:** API base URL mismatch
**Fix:** Ensure frontend is calling `/api/v1/auth/register` not `/api/auth/register`
**Check:** Run `monitor.sh` and look for "API ENDPOINT TESTS" section

### Issue: Database connection failed
**Cause:** Wrong DB_HOST or password changed
**Fix:**
1. Ensure `DB_HOST=postgres` in `.env`
2. If password changed, delete the volume: `docker volume rm quicksellmonster_postgres_data`
3. Redeploy: `sudo bash deploy.sh`

### Issue: Services keep restarting
**Cause:** Application crashes, check logs
**Fix:**
```bash
docker compose -f docker-compose.prod.yml logs backend
```

### Issue: Frontend shows blank page
**Cause:** Build failed or nginx misconfiguration
**Fix:**
```bash
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml restart frontend
```

---

## Health Check Endpoints

- Backend Health: `http://YOUR_IP:5000/health`
- Frontend: `http://YOUR_IP:8080`
- Registration API: `http://YOUR_IP:5000/api/v1/auth/register`

---

## Script Permissions

Make scripts executable:
```bash
chmod +x deploy.sh
chmod +x quick-deploy.sh
chmod +x monitor.sh
```

---

## Getting Help

If you see errors:
1. Run `bash monitor.sh` to get full diagnostics
2. Check the specific service logs
3. Verify `.env` configuration
4. Ensure Docker has enough resources (disk space, memory)

For persistent issues, provide the output of `monitor.sh` for troubleshooting.
