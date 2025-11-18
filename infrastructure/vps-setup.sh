#!/bin/bash
set -e

# Production VPS Setup Script
# Ubuntu 20.04 LTS

echo "🚀 Starting Traffic2uMarketing VPS Production Setup..."

# Colors for output
RED='[0;31m'
GREEN='[0;32m'
YELLOW='[1;33m'
NC='[0m' # No Color

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
docker ps --format "table {{.Names}}\t{{.Status}}"
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
