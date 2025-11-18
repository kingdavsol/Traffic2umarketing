#!/usr/bin/env python3
"""
Phase 6: Deploy All 30 Apps to Production VPS
Complete infrastructure orchestration and deployment
"""

from pathlib import Path
import json
import subprocess

def create_master_docker_compose():
    """Create master docker-compose.yml for all 30 apps"""
    apps = [
        "01-SnapSave", "02-CashFlowMap", "03-GigStack", "04-VaultPay", "05-DebtBreak",
        "06-PeriFlow", "07-TeleDocLocal", "08-NutriBalance", "09-MentalMate", "10-ActiveAge",
        "11-TaskBrain", "12-MemoShift", "13-CodeSnap", "14-DraftMate", "15-FocusFlow",
        "16-PuzzleQuest", "17-CityBuilderLite", "18-StoryRunner", "19-SkillMatch", "20-ZenGarden",
        "21-GuardVault", "22-NoTrace", "23-CipherText", "24-LocalEats", "25-ArtisanHub",
        "26-QualityCheck", "27-SkillBarter", "28-ClimateTrack", "29-CrewNetwork", "30-AuraRead"
    ]

    compose = '''version: '3.9'

services:
  # MongoDB databases for each app
  mongo-master:
    image: mongo:7.0
    container_name: mongo-master
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD:-change-me}
    volumes:
      - mongo-data:/data/db
      - mongo-config:/data/configdb
    networks:
      - apps-network
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis for caching and sessions
  redis:
    image: redis:7-alpine
    container_name: redis-cache
    restart: always
    ports:
      - "6379:6379"
    command: redis-server --requirepass ${REDIS_PASSWORD:-change-me}
    volumes:
      - redis-data:/data
    networks:
      - apps-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Nginx reverse proxy
  nginx:
    image: nginx:latest
    container_name: nginx-proxy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/nginx/sites-enabled:/etc/nginx/sites-enabled:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - nginx-logs:/var/log/nginx
    depends_on:
      - api-gateway
    networks:
      - apps-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  # API Gateway
  api-gateway:
    image: node:18-alpine
    container_name: api-gateway
    restart: always
    working_dir: /app
    command: npm start
    environment:
      NODE_ENV: production
      PORT: 3000
    volumes:
      - ./api-gateway:/app
    depends_on:
      mongo-master:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - apps-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

'''

    # Add services for each app backend
    port = 5001
    for i, app_name in enumerate(apps, 1):
        service_name = app_name.replace('-', '_').lower()
        compose += f'''
  {service_name}:
    build:
      context: ./apps/{app_name}/backend
      dockerfile: Dockerfile
    container_name: {service_name}
    restart: always
    environment:
      NODE_ENV: production
      PORT: {port}
      MONGODB_URI: mongodb://admin:${{MONGO_PASSWORD:-change-me}}@mongo-master:27017/{service_name}?authSource=admin
      REDIS_URL: redis://:${{REDIS_PASSWORD:-change-me}}@redis:6379
      JWT_SECRET: ${{JWT_SECRET_{i}:-change-me}}
      API_GATEWAY_URL: http://api-gateway:3000
    depends_on:
      mongo-master:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - apps-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:{port}/health"]
      interval: 30s
      timeout: 3s
      retries: 3
    expose:
      - "{port}"

'''
        port += 1

    # Add volumes and networks
    compose += '''
volumes:
  mongo-data:
    driver: local
  mongo-config:
    driver: local
  redis-data:
    driver: local
  nginx-logs:
    driver: local

networks:
  apps-network:
    driver: bridge
'''

    with open(Path("/home/user/Traffic2umarketing/docker-compose.production.yml"), "w") as f:
        f.write(compose)


def create_vps_setup_script():
    """Create comprehensive VPS setup script"""
    script = '''#!/bin/bash
set -e

# Production VPS Setup Script
# Ubuntu 20.04 LTS

echo "🚀 Starting Traffic2uMarketing VPS Production Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Install Docker
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose
echo -e "${YELLOW}📝 Installing Docker Compose...${NC}"
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js
echo -e "${YELLOW}⚙️ Installing Node.js...${NC}"
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install MongoDB CLI tools
echo -e "${YELLOW}📦 Installing MongoDB CLI tools...${NC}"
apt-get install -y mongodb-org-tools

# Install Nginx
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
apt-get install -y nginx

# Install Certbot for SSL
echo -e "${YELLOW}🔒 Installing Certbot...${NC}"
apt-get install -y certbot python3-certbot-nginx

# Install PM2
echo -e "${YELLOW}📊 Installing PM2...${NC}"
npm install -g pm2

# Create necessary directories
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p /app/Traffic2uMarketing
mkdir -p /var/log/traffic2umarketing
mkdir -p /var/lib/traffic2umarketing
mkdir -p /etc/traffic2umarketing

# Configure firewall
echo -e "${YELLOW}🔥 Configuring UFW firewall...${NC}"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create non-root user
echo -e "${YELLOW}👤 Creating app user...${NC}"
useradd -m -s /bin/bash traffic2u || true
usermod -aG docker traffic2u || true

# Set up log rotation
echo -e "${YELLOW}📋 Setting up log rotation...${NC}"
cat > /etc/logrotate.d/traffic2umarketing << 'EOF'
/var/log/traffic2umarketing/*.log {
  daily
  rotate 14
  compress
  delaycompress
  notifempty
  create 0640 traffic2u traffic2u
  sharedscripts
  postrotate
    systemctl reload traffic2umarketing > /dev/null 2>&1 || true
  endscript
}
EOF

# Create environment file template
echo -e "${YELLOW}⚙️ Creating environment configuration...${NC}"
cat > /etc/traffic2umarketing/.env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production
MONGO_PASSWORD=your_secure_mongo_password
REDIS_PASSWORD=your_secure_redis_password
JWT_SECRET_1=your_jwt_secret_1
JWT_SECRET_2=your_jwt_secret_2
# ... add more JWT_SECRET_* for all 30 apps

# Database
MONGODB_URI=mongodb://admin:${MONGO_PASSWORD}@mongo-master:27017
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# API Settings
API_RATE_LIMIT=100
API_TIMEOUT=30000

# Monitoring
SENTRY_DSN=
NEWRELIC_LICENSE_KEY=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EOF

chmod 600 /etc/traffic2umarketing/.env.production

# Create systemd service
echo -e "${YELLOW}🔧 Creating systemd service...${NC}"
cat > /etc/systemd/system/traffic2umarketing.service << 'EOF'
[Unit]
Description=Traffic2uMarketing Docker Services
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
User=traffic2u
WorkingDirectory=/app/Traffic2uMarketing
EnvironmentFile=/etc/traffic2umarketing/.env.production
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload

# Enable Docker service
echo -e "${YELLOW}🔌 Enabling Docker...${NC}"
systemctl enable docker
systemctl start docker

# Create monitoring script
echo -e "${YELLOW}📊 Setting up monitoring...${NC}"
cat > /usr/local/bin/monitor-traffic2u << 'EOF'
#!/bin/bash

echo "=== Traffic2uMarketing Production Monitoring ==="
echo ""

echo "Docker Containers Status:"
docker ps --format "table {{.Names}}\\t{{.Status}}"
echo ""

echo "Disk Usage:"
df -h | grep -E '^/dev/|Filesystem'
echo ""

echo "Memory Usage:"
free -h
echo ""

echo "Network Stats:"
netstat -tln | grep LISTEN
echo ""

echo "Application Logs (last 50 lines):"
docker logs --tail 50 nginx-proxy 2>/dev/null || echo "Nginx logs not available"
EOF

chmod +x /usr/local/bin/monitor-traffic2u

echo ""
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update /etc/traffic2umarketing/.env.production with your secrets"
echo "2. Copy your project to /app/Traffic2uMarketing"
echo "3. Run: systemctl enable traffic2umarketing"
echo "4. Run: systemctl start traffic2umarketing"
echo "5. Monitor with: monitor-traffic2u"
echo ""
echo "Certificate Setup:"
echo "certbot certonly --nginx -d yourdomain.com"
echo ""
'''

    with open(Path("/home/user/Traffic2umarketing/infrastructure/vps-setup.sh"), "w") as f:
        f.write(script)

    # Make it executable
    Path("/home/user/Traffic2umarketing/infrastructure/vps-setup.sh").chmod(0o755)


def create_deployment_automation():
    """Create GitHub Actions deployment workflow"""
    workflow = '''name: Deploy to Production VPS

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to VPS
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /app/Traffic2uMarketing
            git pull origin main
            docker-compose -f docker-compose.production.yml pull
            docker-compose -f docker-compose.production.yml up -d
            docker-compose -f docker-compose.production.yml exec mongo-master bash -c "mongosh --eval 'db.adminCommand({setParameter: 1, logComponentVerbosity: {storage: {recovery: 1}}})"

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Production Deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
'''

    workflow_dir = Path("/home/user/Traffic2umarketing/.github/workflows")
    workflow_dir.mkdir(parents=True, exist_ok=True)

    with open(workflow_dir / "deploy.yml", "w") as f:
        f.write(workflow)


def create_api_gateway():
    """Create centralized API Gateway"""
    gateway = '''const express = require('express');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const redis = require('redis');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later'
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Service discovery endpoints
const apps = [
  { id: 1, name: 'SnapSave', port: 5001 },
  { id: 2, name: 'CashFlowMap', port: 5002 },
  { id: 3, name: 'GigStack', port: 5003 },
  { id: 4, name: 'VaultPay', port: 5004 },
  { id: 5, name: 'DebtBreak', port: 5005 },
  { id: 6, name: 'PeriFlow', port: 5006 },
  { id: 7, name: 'TeleDocLocal', port: 5007 },
  { id: 8, name: 'NutriBalance', port: 5008 },
  { id: 9, name: 'MentalMate', port: 5009 },
  { id: 10, name: 'ActiveAge', port: 5010 },
  { id: 11, name: 'TaskBrain', port: 5011 },
  { id: 12, name: 'MemoShift', port: 5012 },
  { id: 13, name: 'CodeSnap', port: 5013 },
  { id: 14, name: 'DraftMate', port: 5014 },
  { id: 15, name: 'FocusFlow', port: 5015 },
  { id: 16, name: 'PuzzleQuest', port: 5016 },
  { id: 17, name: 'CityBuilderLite', port: 5017 },
  { id: 18, name: 'StoryRunner', port: 5018 },
  { id: 19, name: 'SkillMatch', port: 5019 },
  { id: 20, name: 'ZenGarden', port: 5020 },
  { id: 21, name: 'GuardVault', port: 5021 },
  { id: 22, name: 'NoTrace', port: 5022 },
  { id: 23, name: 'CipherText', port: 5023 },
  { id: 24, name: 'LocalEats', port: 5024 },
  { id: 25, name: 'ArtisanHub', port: 5025 },
  { id: 26, name: 'QualityCheck', port: 5026 },
  { id: 27, name: 'SkillBarter', port: 5027 },
  { id: 28, name: 'ClimateTrack', port: 5028 },
  { id: 29, name: 'CrewNetwork', port: 5029 },
  { id: 30, name: 'AuraRead', port: 5030 }
];

// Service registry
app.get('/api/services', (req, res) => {
  res.json(apps.map(app => ({
    name: app.name,
    url: `http://localhost:${app.port}`,
    internal: `http://${app.name.replace(/[A-Z]/g, l => l === app.name[0] ? l : l.toLowerCase())}:${app.port}`
  })));
});

// Proxy routes to individual services
app.use('/api/:service', (req, res) => {
  const service = apps.find(a => a.name.toLowerCase().replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase() === req.params.service.toLowerCase());

  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }

  const targetUrl = `http://localhost:${service.port}${req.originalUrl.replace(/^\\/api\\/[^\\/]+/, '')}`;

  require('http-proxy').createProxyServer({
    target: targetUrl,
    changeOrigin: true
  }).web(req, res);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});

module.exports = app;
'''

    gateway_dir = Path("/home/user/Traffic2umarketing/api-gateway")
    gateway_dir.mkdir(exist_ok=True)

    with open(gateway_dir / "server.js", "w") as f:
        f.write(gateway)

    # Create package.json
    pkg = {
        "name": "traffic2u-api-gateway",
        "version": "1.0.0",
        "description": "Central API Gateway for all Traffic2uMarketing apps",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        "dependencies": {
            "express": "^4.18.2",
            "cors": "^2.8.5",
            "compression": "^1.7.4",
            "express-rate-limit": "^6.7.0",
            "mongoose": "^7.0.0",
            "redis": "^4.6.0",
            "http-proxy": "^1.18.1"
        }
    }

    with open(gateway_dir / "package.json", "w") as f:
        json.dump(pkg, f, indent=2)

    # Create Dockerfile
    dockerfile = '''FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "require('http').get('http://localhost:3000/health')"
CMD ["npm", "start"]
'''

    with open(gateway_dir / "Dockerfile", "w") as f:
        f.write(dockerfile)


def create_monitoring_dashboard():
    """Create Prometheus monitoring configuration"""
    prometheus_config = '''global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'traffic2umarketing-production'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'docker'
    static_configs:
      - targets: ['localhost:9323']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongo-master:27017']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

alert_rules_files:
  - '/etc/prometheus/alert-rules.yml'
'''

    alert_rules = '''groups:
  - name: traffic2umarketing
    rules:
      - alert: ContainerDown
        expr: up{job=~".*"} == 0
        for: 2m
        annotations:
          summary: "Container {{ $labels.job }} is down"

      - alert: HighMemoryUsage
        expr: container_memory_usage_bytes / 1e9 > 1
        for: 5m
        annotations:
          summary: "High memory usage: {{ $value }}GB"

      - alert: HighCPUUsage
        expr: rate(container_cpu_usage_seconds_total[5m]) > 0.8
        for: 5m
        annotations:
          summary: "High CPU usage: {{ $value }}"

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} / 1e9 < 10
        for: 5m
        annotations:
          summary: "Disk space running low: {{ $value }}GB remaining"
'''

    monitoring_dir = Path("/home/user/Traffic2umarketing/infrastructure/monitoring")
    monitoring_dir.mkdir(parents=True, exist_ok=True)

    with open(monitoring_dir / "prometheus.yml", "w") as f:
        f.write(prometheus_config)

    with open(monitoring_dir / "alert-rules.yml", "w") as f:
        f.write(alert_rules)


def create_backup_strategy():
    """Create automated backup scripts"""
    backup_script = '''#!/bin/bash

# Automated Backup Strategy
# Daily snapshots of databases and configurations

BACKUP_DIR="/backups/traffic2umarketing"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
echo "🗄️  Backing up MongoDB..."
docker exec mongo-master mongodump --authenticationDatabase admin -u admin -p $MONGO_PASSWORD -o $BACKUP_DIR/mongodb_$TIMESTAMP

# Backup Redis
echo "🗄️  Backing up Redis..."
docker exec redis redis-cli --rdb $BACKUP_DIR/redis_$TIMESTAMP.rdb

# Compress backups
echo "📦 Compressing backups..."
tar -czf $BACKUP_DIR/backup_$TIMESTAMP.tar.gz $BACKUP_DIR/mongodb_$TIMESTAMP $BACKUP_DIR/redis_$TIMESTAMP.rdb

# Clean old backups
echo "🗑️  Cleaning old backups..."
find $BACKUP_DIR -type f -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3 (optional)
if command -v aws &> /dev/null; then
  echo "☁️  Uploading to S3..."
  aws s3 cp $BACKUP_DIR/backup_$TIMESTAMP.tar.gz s3://traffic2u-backups/
fi

echo "✅ Backup complete!"
'''

    backup_dir = Path("/home/user/Traffic2umarketing/infrastructure/scripts")
    backup_dir.mkdir(parents=True, exist_ok=True)

    with open(backup_dir / "backup.sh", "w") as f:
        f.write(backup_script)

    Path(backup_dir / "backup.sh").chmod(0o755)

    # Create crontab entry
    crontab_entry = '''# Backup daily at 2 AM
0 2 * * * /home/traffic2u/Traffic2uMarketing/infrastructure/scripts/backup.sh >> /var/log/traffic2umarketing/backup.log 2>&1

# Monitor every 5 minutes
*/5 * * * * /usr/local/bin/monitor-traffic2u >> /var/log/traffic2umarketing/monitor.log 2>&1
'''

    with open(backup_dir / "crontab-entries.txt", "w") as f:
        f.write(crontab_entry)


def create_deployment_checklist():
    """Create production deployment checklist"""
    checklist = '''# Production Deployment Checklist

## Pre-Deployment
- [ ] All tests passing locally
- [ ] Code review completed
- [ ] Security scan completed (npm audit, OWASP)
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificates ready
- [ ] DNS records updated
- [ ] CDN configured (if using)
- [ ] Backup system tested
- [ ] Monitoring alerts configured

## Deployment Day
- [ ] Create backup before deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests on staging
- [ ] Get approval for production
- [ ] Schedule maintenance window (optional)
- [ ] Deploy to production
- [ ] Run health checks
- [ ] Monitor logs for errors
- [ ] Monitor CPU/Memory/Disk
- [ ] Monitor error rates

## Post-Deployment
- [ ] Verify all services are running
- [ ] Run full regression tests
- [ ] Check database integrity
- [ ] Verify user authentication
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Review application logs
- [ ] Review access logs
- [ ] Document deployment details
- [ ] Notify team of completion
- [ ] Update status page
- [ ] Gather performance baseline

## Rollback Plan (if needed)
- [ ] Have previous version ready
- [ ] Have database backup ready
- [ ] Have rollback procedure documented
- [ ] Test rollback procedure beforehand
- [ ] Prepare rollback communication

## Post-Deployment (24-48 hours)
- [ ] Monitor error rates
- [ ] Check user feedback
- [ ] Verify analytics data
- [ ] Review performance trends
- [ ] Confirm backup integrity
- [ ] Archive logs
'''

    with open(Path("/home/user/Traffic2umarketing/DEPLOYMENT_CHECKLIST.md"), "w") as f:
        f.write(checklist)


def main():
    """Main deployment orchestration"""
    print("🚀 Phase 6: Production Deployment Setup\n")

    print("📦 Creating master docker-compose configuration...")
    create_master_docker_compose()
    print("✅ Master docker-compose created")

    print("\n🔧 Creating VPS setup script...")
    create_vps_setup_script()
    print("✅ VPS setup script created")

    print("\n🚀 Creating deployment automation...")
    create_deployment_automation()
    print("✅ Deployment automation created")

    print("\n🔌 Creating API Gateway...")
    create_api_gateway()
    print("✅ API Gateway created")

    print("\n📊 Creating monitoring dashboard...")
    create_monitoring_dashboard()
    print("✅ Monitoring configuration created")

    print("\n💾 Creating backup strategy...")
    create_backup_strategy()
    print("✅ Backup scripts created")

    print("\n📋 Creating deployment checklist...")
    create_deployment_checklist()
    print("✅ Deployment checklist created")

    print("\n" + "="*60)
    print("✅ Phase 6 Complete: Production Deployment Infrastructure")
    print("="*60)
    print("\nNext Steps:")
    print("1. Review docker-compose.production.yml")
    print("2. Run VPS setup script on your production server:")
    print("   bash infrastructure/vps-setup.sh")
    print("3. Configure /etc/traffic2umarketing/.env.production")
    print("4. Enable the systemd service:")
    print("   systemctl enable traffic2umarketing")
    print("5. Start deployment:")
    print("   systemctl start traffic2umarketing")
    print("6. Monitor with: monitor-traffic2u")


if __name__ == "__main__":
    main()
