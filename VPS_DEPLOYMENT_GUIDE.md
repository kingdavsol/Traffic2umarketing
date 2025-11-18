# VPS Deployment Guide - Traffic2u Insurance

Complete guide to deploy all 10 insurance comparison sites to your VPS with Docker and Nginx.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [VPS Setup](#vps-setup)
3. [Environment Configuration](#environment-configuration)
4. [SSL Certificate Setup](#ssl-certificate-setup)
5. [Docker Deployment](#docker-deployment)
6. [Production Monitoring](#production-monitoring)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Prerequisites

- **VPS Requirements:**
  - Ubuntu 20.04 or newer (or Debian-based distro)
  - Minimum 8GB RAM (16GB recommended for 10 sites)
  - Minimum 100GB SSD storage
  - 4+ CPU cores recommended
  - Root or sudo access

- **Networking:**
  - All 10 domains registered and pointing to your VPS IP
  - Ports 80 and 443 open (HTTP/HTTPS)
  - Ports 3001-3010 accessible internally (for health checks)

- **Software Requirements (installed by setup script):**
  - Docker & Docker Compose
  - Node.js 18+
  - Certbot (for SSL)
  - PM2 (optional, for non-Docker deployment)

---

## VPS Setup

### Step 1: Initial Server Configuration

SSH into your VPS:
```bash
ssh root@your-vps-ip
```

Clone the repository:
```bash
cd /home
git clone https://github.com/kingdavsol/Traffic2umarketing.git
cd Traffic2umarketing
```

### Step 2: Run Setup Script

Execute the automated setup script (run as root):
```bash
sudo bash scripts/setup-vps.sh
```

This script will:
- Update all system packages
- Install Docker and Docker Compose
- Install Node.js 18
- Install Certbot for SSL certificates
- Create the `traffic2u` system user
- Create necessary directories and set permissions

### Step 3: Verify Installation

Check Docker is running:
```bash
docker --version
docker-compose --version
```

Expected output:
```
Docker version 24.x.x
Docker Compose version 2.x.x
```

---

## Environment Configuration

### Step 1: Create .env File

Copy the example environment file:
```bash
cp .env.example .env
```

### Step 2: Configure Environment Variables

Edit the `.env` file with your specific settings:
```bash
nano .env
```

**Critical settings to update:**

```bash
# Database
DATABASE_URL="postgresql://traffic2u_user:your_strong_password@postgres:5432/traffic2u"
DATABASE_USER="traffic2u_user"
DATABASE_PASSWORD="your_strong_password"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://petcovercompare.com"

# Email (Resend)
RESEND_API_KEY="re_your_actual_api_key"

# Security (Generate random 32+ character strings)
JWT_SECRET="your-random-32-character-string-here"
ENCRYPTION_KEY="your-random-32-character-string-here"

# Email for SSL certificates
CERTBOT_EMAIL="admin@traffic2umarketing.com"
```

### Step 3: Verify Configuration

Validate that all required variables are set:
```bash
grep -E "^(DATABASE|NODE_ENV|RESEND_API_KEY|JWT_SECRET)" .env
```

---

## SSL Certificate Setup

### Step 1: Point Domains to VPS

Ensure all 10 domains are pointing to your VPS IP:
- petcovercompare.com
- disabilityquotehub.com
- cybersmallbizcompare.com
- travelinsurancecompare.io
- umbrellainsurancequotes.com
- motorcycleinsurancehub.com
- sr22insurancequick.com
- weddinginsurancecompare.com
- droneinsurancecompare.io
- landlordinsurancecompare.com

Wait 24-48 hours for DNS propagation and verify:
```bash
nslookup petcovercompare.com
```

### Step 2: Generate SSL Certificates

Stop Nginx/any web servers using ports 80/443 (Docker containers not yet running is fine):
```bash
bash scripts/generate-ssl.sh admin@traffic2umarketing.com
```

This creates:
- SSL certificates in `./ssl/` directory
- Auto-renewal setup via certbot

### Step 3: Verify Certificates

```bash
ls -la ./ssl/
```

You should see `.crt` and `.key` files for each domain.

---

## Docker Deployment

### Step 1: Build Docker Images

```bash
docker-compose build --no-cache
```

This process will:
- Build Docker images for each app
- Install dependencies
- Compile Next.js code
- Create optimized production containers

**Expected time:** 15-30 minutes

### Step 2: Start Services

```bash
docker-compose up -d
```

Monitor startup:
```bash
docker-compose logs -f
```

Wait for "ready - started server on..." messages for each app.

### Step 3: Run Database Migrations

Once containers are running:
```bash
npm run db:push
```

This creates all database tables and schema.

### Step 4: Verify All Services

```bash
docker-compose ps
```

Expected output (all should be "Up"):
```
NAME                        STATUS
pet-insurance-app           Up X minutes
disability-insurance-app    Up X minutes
cyber-insurance-app         Up X minutes
travel-insurance-app        Up X minutes
umbrella-insurance-app      Up X minutes
motorcycle-insurance-app    Up X minutes
sr22-insurance-app          Up X minutes
wedding-insurance-app       Up X minutes
drone-insurance-app         Up X minutes
landlord-insurance-app      Up X minutes
postgres                    Up X minutes
nginx                       Up X minutes
```

### Step 5: Test HTTPS Access

Test a domain in your browser:
```
https://petcovercompare.com
```

All 10 sites should now be live and accessible with HTTPS!

---

## Production Monitoring

### View Logs

View logs for specific service:
```bash
docker-compose logs -f pet-insurance
```

View all logs:
```bash
docker-compose logs -f
```

View Nginx logs:
```bash
docker exec traffic2u_nginx tail -f /var/log/nginx/access.log
```

### Container Health Check

Manually check if containers are healthy:
```bash
docker-compose ps
```

### Database Status

Connect to PostgreSQL:
```bash
docker exec -it traffic2u_postgres psql -U traffic2u_user -d traffic2u
```

Common queries:
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('traffic2u'));

-- Count users
SELECT COUNT(*) FROM "User";

-- Count quote requests
SELECT COUNT(*) FROM "QuoteRequest";

-- Exit
\q
```

### Monitor Resource Usage

```bash
docker stats
```

Shows CPU, memory, and network usage for each container.

---

## Advanced Configuration

### Increase Resource Limits

Edit `docker-compose.yml` to add resource limits:
```yaml
services:
  pet-insurance:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Enable Rate Limiting

In `.env`:
```bash
API_RATE_LIMIT_REQUESTS=100
API_RATE_LIMIT_WINDOW_MS=900000
ENABLE_RATE_LIMITING=true
```

### Set Up Log Rotation

Create `/etc/logrotate.d/traffic2u`:
```
/home/traffic2u/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0640 traffic2u traffic2u
    postrotate
        docker-compose restart postgres >/dev/null 2>&1 || true
    endscript
}
```

---

## Troubleshooting

### Services Won't Start

1. Check logs:
```bash
docker-compose logs -f
```

2. Verify environment variables:
```bash
grep DATABASE_URL .env
```

3. Check database connectivity:
```bash
docker exec traffic2u_postgres pg_isready -U traffic2u_user
```

### Port Already in Use

If ports 80/443 are in use:
```bash
# Find what's using the port
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Kill the process
sudo kill -9 <PID>
```

### Database Connection Error

```bash
# Verify database is running
docker exec traffic2u_postgres psql -U traffic2u_user -c "SELECT 1;"

# Check connection string format
grep DATABASE_URL .env
```

### SSL Certificate Errors

Renew certificates:
```bash
sudo certbot renew --force-renewal
bash scripts/generate-ssl.sh
docker-compose restart nginx
```

### Out of Memory

Check current usage:
```bash
docker stats
df -h
free -h
```

Solutions:
- Increase VPS RAM
- Reduce number of Node cluster instances
- Clear Docker unused images/volumes:
```bash
docker system prune -a
```

---

## Maintenance

### Regular Backups

Backup database daily:
```bash
docker exec traffic2u_postgres pg_dump -U traffic2u_user traffic2u > backup_$(date +%Y%m%d).sql
```

Backup entire data directory:
```bash
tar -czf traffic2u_backup_$(date +%Y%m%d).tar.gz ./ssl ./data
```

### SSL Certificate Renewal

Automatic renewal runs via cron, but to manually renew:
```bash
sudo certbot renew --dry-run
bash scripts/generate-ssl.sh
```

### Application Updates

Pull latest code and redeploy:
```bash
bash scripts/deploy.sh main
```

Or step-by-step:
```bash
git pull origin main
npm ci
npm run build
docker-compose build --no-cache
docker-compose up -d
npm run db:push
```

### Monitoring Disk Space

Check storage usage:
```bash
df -h /
du -sh /home/traffic2u
```

If disk is filling up:
```bash
# Clean Docker unused resources
docker system prune -a --volumes

# Check database size
docker exec traffic2u_postgres psql -U traffic2u_user -d traffic2u -c "SELECT pg_size_pretty(pg_database_size('traffic2u'));"
```

### Monitoring Uptime

Install and use monitoring tools:
```bash
# Option 1: Use Docker's health checks
docker-compose ps

# Option 2: Set up Uptime Kuma (lightweight Docker service)
# Option 3: Use VPS provider's monitoring dashboard
```

---

## Security Best Practices

1. **Regular Updates**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   docker-compose pull
   ```

2. **Firewall Configuration**
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

3. **SSH Key Authentication Only**
   - Disable password authentication in `/etc/ssh/sshd_config`
   - Use SSH keys instead

4. **Monitor Logs for Attacks**
   ```bash
   grep "error\|ERROR\|unauthorized" docker-compose logs
   ```

5. **Regular Security Audits**
   ```bash
   docker exec traffic2u_postgres psql -U traffic2u_user -d traffic2u -c "SELECT * FROM \"User\" WHERE deleted_at IS NULL LIMIT 10;"
   ```

---

## Performance Optimization

### Enable Nginx Caching

Already configured in `nginx.conf`, but verify:
```bash
grep -A5 "proxy_cache" nginx.conf
```

### Enable Gzip Compression

Already enabled in `nginx.conf`.

### Monitor Query Performance

```bash
docker exec traffic2u_postgres psql -U traffic2u_user -d traffic2u << EOF
-- Long-running queries
SELECT query, calls, mean_time FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;
EOF
```

### Connection Pooling

Already configured in `docker-compose.yml` with:
```
DATABASE_POOL_SIZE="20"
```

---

## Contact & Support

- **Documentation:** See README files in each app directory
- **Issues:** Check logs with `docker-compose logs -f`
- **Updates:** Pull latest code with `bash scripts/deploy.sh`

---

## Quick Reference Commands

```bash
# View all services
docker-compose ps

# View logs for one service
docker-compose logs -f pet-insurance

# Restart all services
docker-compose restart

# Restart one service
docker-compose restart pet-insurance

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Update and redeploy
bash scripts/deploy.sh main

# Check database
docker exec traffic2u_postgres psql -U traffic2u_user -d traffic2u

# Tail application logs
docker-compose logs -f --tail=100

# Export database backup
docker exec traffic2u_postgres pg_dump -U traffic2u_user traffic2u > backup.sql
```

---

**Deployment Date:** November 2025
**Status:** Production Ready
**All 10 Sites:** Live and Monitored
