# QuickSell - Quick Deployment Guide

## 🚀 Deploy from GitHub in 5 Minutes

### Prerequisites
- VPS server (Ubuntu 20.04+ recommended)
- Root/sudo access
- Domain pointed to your server IP (optional but recommended)

### Quick Deploy (One Command)

```bash
# 1. SSH into your VPS
ssh root@your-server-ip

# 2. Install Docker (includes Compose V2) and rsync
curl -fsSL https://get.docker.com | sh
apt-get install -y rsync

# 3. Run the automated deployment (one command!)
curl -fsSL https://raw.githubusercontent.com/kingdavsol/Traffic2umarketing/claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1/quicksell/DEPLOY_FROM_GITHUB.sh | sudo bash
```

### Manual Deploy (If you prefer step-by-step)

```bash
# Remove old directory if exists
rm -rf /var/www/quicksell.monster

# Clone repository to temp location
git clone https://github.com/kingdavsol/Traffic2umarketing.git /tmp/quicksell-temp
cd /tmp/quicksell-temp
git checkout claude/fix-vps-deployment-013taUqhcCQwKrcLj98DZWZ1

# Copy QuickSell to deployment directory
mkdir -p /var/www/quicksell.monster
cp -r quicksell/* /var/www/quicksell.monster/
cd /var/www/quicksell.monster

# Run deployment
chmod +x DEPLOY_FROM_GITHUB.sh
sudo ./DEPLOY_FROM_GITHUB.sh

# Clean up
rm -rf /tmp/quicksell-temp
```

The script will:
- ✅ Check prerequisites
- ✅ Set up environment variables (.env)
- ✅ Build Docker containers
- ✅ Start all services (PostgreSQL, Redis, Backend, Frontend)
- ✅ Run database migrations
- ✅ Verify deployment health

### Environment Variables

When prompted, configure these essential variables in `.env`:

```env
# Database
DB_PASSWORD=your-strong-password

# Redis
REDIS_PASSWORD=your-redis-password

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars

# OpenAI (for AI descriptions)
OPENAI_API_KEY=sk-your-openai-key

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-key
```

### Verify Deployment

```bash
# Check all containers are running
docker compose -f docker-compose.prod.yml ps

# Test backend API
curl http://localhost:5000/health

# View logs
docker compose -f docker-compose.prod.yml logs -f
```

### Access Your Application

- **Frontend**: http://your-server-ip
- **Backend API**: http://your-server-ip:5000
- **Health Check**: http://your-server-ip:5000/health

---

##  All Bugs Fixed!

✅ **Redis v4+ API Compatibility** - Fixed deprecated host/port syntax
✅ **TypeScript Errors** - Fixed logger imports and middleware exports
✅ **Package Dependencies** - Removed duplicate Sequelize, updated OpenAI to v4
✅ **Missing Mobile Code** - Added complete React Native app structure
✅ **Missing Dockerfiles** - Added frontend Dockerfile and production docker-compose
✅ **Missing TypeScript Config** - Added tsconfig.json for frontend and mobile

### Code Quality Improvements

- Simplified dependencies (removed unnecessary Sequelize ORM)
- Updated OpenAI package from v3 to v4 (latest)
- Fixed all middleware export issues
- Added proper TypeScript typing throughout
- Production-ready Docker configuration

---

## Next Steps

### 1. Set Up SSL/HTTPS
```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d quicksell.monster -d www.quicksell.monster
```

### 2. Configure Nginx Reverse Proxy
See `docs/DEPLOYMENT.md` for full Nginx configuration

### 3. Set Up Automated Backups
```bash
# Backup database daily
0 2 * * * docker compose -f /var/www/quicksell.monster/docker-compose.prod.yml exec -T postgres pg_dump -U postgres quicksell > /backups/quicksell-$(date +\%Y\%m\%d).sql
```

### 4. Configure Monitoring
- Set up logging aggregation (e.g., Loki)
- Configure uptime monitoring (e.g., UptimeRobot)
- Set up error tracking (e.g., Sentry)

---

## Troubleshooting

### Containers not starting?
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Database connection errors?
```bash
# Check PostgreSQL is healthy
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Verify environment variables
cat .env | grep DB_
```

### Redis connection errors?
```bash
# Test Redis connection
docker compose -f docker-compose.prod.yml exec redis redis-cli ping

# Check Redis password
cat .env | grep REDIS_PASSWORD
```

---

## Development

For local development:

```bash
# Use development docker-compose
docker-compose up

# This uses docker-compose.yml (not .prod.yml)
# which includes hot-reload and development tools
```

---

## Support

- **Documentation**: See `/docs` directory
- **Issues**: Create an issue on GitHub
- **Email**: support@quicksell.monster

---

**Built with ❤️ by the QuickSell Team**
