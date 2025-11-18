# Smart Deployment Guide

## Overview

The Smart Deployment system automatically detects which apps have changed and deploys only those apps to their correct domains and ports. This saves time and reduces risk by:

1. **Auto-detecting changes** → Only deploying apps that actually changed
2. **Domain mapping** → Each app automatically routes to its correct domain
3. **Port management** → Each app gets its correct port (3001-3010)
4. **Selective deployment** → Leave untouched apps running while updating others
5. **Automated routing** → Nginx automatically routes requests to correct ports

## Architecture

```
domains.json (Configuration)
    ↓
GitHub Actions (Detect Changes)
    ↓
deploy-smart.sh (Smart Deployment)
    ↓
docker-compose (Container Orchestration)
    ↓
nginx (Route to Correct Port)
    ↓
Domain → Service
```

## Configuration Files

### 1. domains.json

Maps each app to its domain, port, and configuration.

**Location**: `/domains.json`

**Structure**:
```json
{
  "apps": [
    {
      "id": "pet-insurance",
      "name": "Pet Insurance Compare",
      "appDir": "apps/pet-insurance-compare",
      "dockerfile": "apps/pet-insurance-compare/Dockerfile",
      "container": "pet-insurance-app",
      "serviceName": "pet-insurance",
      "port": 3001,
      "domain": "petcovercompare.com",
      "appUrl": "https://petcovercompare.com",
      "apiUrl": "https://petcovercompare.com/api"
    },
    // ... 9 more apps
  ]
}
```

**Fields**:
- `id`: Unique app identifier (used in deployment)
- `name`: Human-readable name
- `appDir`: Directory path in monorepo
- `dockerfile`: Path to Dockerfile
- `container`: Docker container name
- `serviceName`: Docker Compose service name
- `port`: Internal port (3001-3010)
- `domain`: Production domain name
- `appUrl`: Full HTTPS app URL
- `apiUrl`: Full HTTPS API URL

### 2. deploy-smart.sh

Smart deployment script that reads domains.json and deploys apps.

**Location**: `/scripts/deploy-smart.sh`

**Features**:
- Auto-detects changed apps from git
- Reads domain mapping from domains.json
- Deploys only specified apps
- Verifies container health
- Runs database migrations
- Validates nginx configuration

## Deployment Methods

### Method 1: GitHub Actions (Recommended)

Automatic deployment on git push with change detection.

#### Setup:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add these 3 secrets:
   - `VPS_HOST`: Your VPS IP or domain
   - `VPS_USERNAME`: SSH username (e.g., `traffic2u`)
   - `VPS_PASSWORD`: SSH password

#### Usage:

**Auto-detect and deploy changed apps:**
```bash
git commit -m "Update pet insurance compare page"
git push origin claude/my-feature
# GitHub Actions automatically:
# 1. Detects that pet-insurance app changed
# 2. Deploys only pet-insurance container
# 3. Routes petcovercompare.com → port 3001
# 4. Keeps other 9 apps running
```

**Deploy all apps manually:**
Go to GitHub → Actions → "Smart Deploy to VPS" → "Run workflow" → Choose "all-apps"

**Deploy specific apps manually:**
Go to GitHub → Actions → "Smart Deploy to VPS" → "Run workflow" → Choose "auto-detect"

### Method 2: Local Deployment (During Development)

Deploy apps from your local machine.

#### Prerequisites:
- Docker and Docker Compose installed
- SSH access to VPS
- `.env` file configured on VPS at `/home/traffic2u/.env`

#### Usage:

**Deploy all apps:**
```bash
./scripts/deploy-smart.sh --all
```

**Deploy specific app:**
```bash
./scripts/deploy-smart.sh --app=pet-insurance
```

**Deploy changed apps only:**
```bash
./scripts/deploy-smart.sh
```

**Deploy from specific branch:**
```bash
./scripts/deploy-smart.sh --branch=main --app=disability-insurance
```

### Method 3: Manual Docker Deployment

Deploy individual containers directly.

```bash
# SSH to VPS
ssh traffic2u@your-vps-ip

# Navigate to project
cd /home/traffic2u

# Build specific container
docker-compose build pet-insurance

# Start container
docker-compose up -d pet-insurance

# Verify
docker-compose ps pet-insurance
```

## How It Works

### Step 1: Change Detection

When you push code, GitHub Actions automatically:

1. Compares your branch with main branch
2. Checks which files changed
3. Matches changed files to app directories from domains.json
4. Identifies affected apps

**Example**:
```bash
# You change: apps/pet-insurance-compare/src/page.tsx
# System detects: pet-insurance app changed
# Result: Only pet-insurance gets redeployed
```

### Step 2: Domain Mapping

Once apps are identified, deploy-smart.sh:

1. Reads app info from domains.json
2. Gets port, domain, environment variables
3. Builds Docker image with correct configuration
4. Starts container on correct port

**Port Assignment**:
```
pet-insurance           → port 3001 → petcovercompare.com
disability-insurance    → port 3002 → disabilityquotehub.com
cyber-insurance         → port 3003 → cybersmallbizcompare.com
travel-insurance        → port 3004 → travelinsurancecompare.io
umbrella-insurance      → port 3005 → umbrellainsurancequotes.com
motorcycle-insurance    → port 3006 → motorcycleinsurancehub.com
sr22-insurance          → port 3007 → sr22insurancequick.com
wedding-insurance       → port 3008 → weddinginsurancecompare.com
drone-insurance         → port 3009 → droneinsurancecompare.io
landlord-insurance      → port 3010 → landlordinsurancecompare.com
```

### Step 3: Container Orchestration

Docker Compose:

1. Builds new image from correct Dockerfile
2. Stops old container (if running)
3. Starts new container on correct port
4. Verifies container health (waits 5 seconds)
5. Confirms it's running

### Step 4: Nginx Routing

Nginx reverse proxy:

1. Listens on port 80 (HTTP) and 443 (HTTPS)
2. Routes requests based on domain
3. Forwards to correct internal port
4. Applies SSL/TLS encryption
5. Caches responses
6. Rate limits if needed

**Example request flow**:
```
User: https://petcovercompare.com
           ↓
    Nginx (port 443)
           ↓
    Route lookup: petcovercompare.com → port 3001
           ↓
    pet-insurance container (port 3001)
           ↓
    Response sent back to user
```

## App Directory Structure

Each app must follow this structure for auto-detection to work:

```
apps/
├── pet-insurance-compare/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── disability-insurance-compare/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   └── ...
└── [8 more apps...]
```

**When you change any file in `apps/pet-insurance-compare/`:**
- System detects `pet-insurance` app changed
- Only that app gets redeployed
- Other 9 apps remain untouched

## Environment Variables

Each app gets these variables from your VPS `.env` file:

```bash
# Shared across all apps
NODE_ENV=production
DATABASE_URL=postgresql://...
RESEND_API_KEY=re_...
JWT_SECRET=...
ENCRYPTION_KEY=...

# App-specific (from domains.json)
NEXT_PUBLIC_APP_URL=https://petcovercompare.com  # Per app
NEXT_PUBLIC_API_URL=https://petcovercompare.com/api  # Per app
```

## Monitoring Deployments

### GitHub Actions:

1. Go to GitHub repository
2. Click **Actions** tab
3. Click **Smart Deploy to VPS**
4. View deployment logs in real-time

**Log sections**:
- ✓ Detect changes: Which apps changed
- ✓ Build: Docker image building
- ✓ Deploy: Container starting
- ✓ Health check: Container verification
- ✓ Migrations: Database updates
- ✓ Summary: All services status

### VPS Console:

```bash
# SSH to VPS
ssh traffic2u@your-vps-ip
cd /home/traffic2u

# View all services
docker-compose ps

# View specific service logs
docker-compose logs pet-insurance

# Follow logs in real-time
docker-compose logs -f pet-insurance

# View nginx logs
docker-compose logs -f nginx
```

## Troubleshooting

### Issue: App not deployed

**Check 1: Verify changes detected**
```bash
git diff --name-only origin/main...HEAD
# Should show files in apps/[app-name]/
```

**Check 2: Verify app directory in domains.json**
```bash
cat domains.json | grep -A 5 "app-id"
# appDir should match your directory
```

**Check 3: Verify Docker build**
```bash
cd /home/traffic2u
docker-compose build pet-insurance
# Look for build errors
```

### Issue: Port conflict

**Error**: `Error starting container: port 3001 already in use`

**Solution**:
```bash
# Find process using port 3001
lsof -i :3001

# Stop and restart docker
docker-compose down
docker-compose up -d
```

### Issue: Domain not resolving

**Check 1: DNS resolution**
```bash
nslookup petcovercompare.com
# Should show your VPS IP
```

**Check 2: Nginx configuration**
```bash
docker-compose exec nginx nginx -t
# Should say "successful"
```

**Check 3: SSL certificates**
```bash
ls -la /home/traffic2u/ssl/
# Should show .crt and .key files
```

### Issue: Container keeps restarting

**Check logs**:
```bash
docker-compose logs pet-insurance
# Look for error messages
```

**Common causes**:
- Missing environment variables
- Database connection failed
- Port already in use
- Missing Dockerfile

### Issue: Database migrations failed

**Check if database is running**:
```bash
docker-compose ps postgres
# Should show "Up"
```

**Manually run migrations**:
```bash
cd /home/traffic2u
npm run db:push
```

## Performance Tips

### 1. Only Deploy Changed Apps

Don't use `--all` unless necessary. Let auto-detection work.

```bash
# Good: Auto-detect changes
git push  # Only changed apps deploy

# Avoid unless needed: Deploy all
./scripts/deploy-smart.sh --all  # All 10 apps rebuild
```

### 2. Disable Health Checks During Testing

For faster deployments during development:

```bash
# In domains.json, temporarily remove health checks
# Then redeploy
./scripts/deploy-smart.sh --app=pet-insurance
```

### 3. Use Docker BuildKit

For faster builds:

```bash
export DOCKER_BUILDKIT=1
./scripts/deploy-smart.sh --all
```

### 4. Cache Dependencies

Keep `node_modules` between deploys:

```bash
# In Dockerfile, leverage layer caching
# First copy package.json
# Then npm install
# Then copy code

# This way, if only code changes, npm install is cached
```

## Advanced Configuration

### Add a New App

1. **Create app directory**:
```bash
mkdir -p apps/new-insurance-compare
```

2. **Update domains.json**:
```json
{
  "id": "new-insurance",
  "name": "New Insurance Compare",
  "appDir": "apps/new-insurance-compare",
  "dockerfile": "apps/new-insurance-compare/Dockerfile",
  "serviceName": "new-insurance",
  "port": 3011,
  "domain": "newinsurancecompare.com"
}
```

3. **Update docker-compose.yml**:
```yaml
new-insurance:
  build:
    context: .
    dockerfile: apps/new-insurance-compare/Dockerfile
  container_name: new-insurance-app
  ports:
    - "3011:3000"
  # ... other config
```

4. **Update nginx.conf**:
```nginx
server {
  server_name newinsurancecompare.com;
  location / {
    proxy_pass http://new-insurance:3000;
  }
}
```

5. **Push to deploy**:
```bash
git add .
git commit -m "Add new insurance comparison site"
git push origin claude/new-site
```

### Exclude Directories from Change Detection

To prevent certain changes from triggering deployments:

**Edit .github/workflows/deploy-to-vps-smart.yml**:

```yaml
# Only deploy on changes to apps/ or specific files
if: |
  contains(github.event.head_commit.modified, 'apps/') ||
  contains(github.event.head_commit.modified, 'docker-compose.yml')
```

### Custom Deployment Order

To deploy apps in specific order (e.g., database dependencies first):

**Edit scripts/deploy-smart.sh**:

```bash
# Define deployment order
DEPLOY_ORDER=(
  "database-related-app"
  "other-dependencies"
  "pet-insurance"
  "disability-insurance"
  # ... etc
)

# Deploy in order
for app in "${DEPLOY_ORDER[@]}"; do
  deploy_app "$app"
done
```

## Checklist

Before deploying with smart deployment:

- [ ] All 3 GitHub Secrets are set (VPS_HOST, VPS_USERNAME, VPS_PASSWORD)
- [ ] `.env` file exists on VPS at `/home/traffic2u/.env`
- [ ] PostgreSQL database is running
- [ ] Docker and Docker Compose installed on VPS
- [ ] Nginx configured with all domains
- [ ] SSL certificates generated for all domains
- [ ] All app directories exist in monorepo
- [ ] All Dockerfiles exist
- [ ] domains.json is valid JSON (validate with `jq`)

## Quick Reference

### Deploy changed apps (automatic)
```bash
git push origin my-feature
# GitHub Actions auto-detects and deploys only changed apps
```

### Deploy specific app
```bash
./scripts/deploy-smart.sh --app=pet-insurance
```

### Deploy all apps
```bash
./scripts/deploy-smart.sh --all
```

### View deployment status
```bash
ssh traffic2u@your-vps-ip
cd /home/traffic2u
docker-compose ps
```

### View logs
```bash
docker-compose logs -f pet-insurance
```

### Verify domains
```bash
curl -I https://petcovercompare.com
# Should return 200 OK
```

### Restart single app
```bash
docker-compose restart pet-insurance
```

### Restart all apps
```bash
docker-compose down
docker-compose up -d
```

## Support

For issues or questions:

1. Check VPS logs: `docker-compose logs [service]`
2. Check GitHub Actions logs: GitHub → Actions tab
3. Verify domains.json: `jq . domains.json`
4. Verify nginx config: `docker-compose exec nginx nginx -t`
5. Test manually: `./scripts/deploy-smart.sh --app=pet-insurance`
