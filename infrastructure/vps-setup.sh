#!/bin/bash

set -e

echo "🚀 Setting up VPS for 30 apps..."

# Update system
apt-get update
apt-get upgrade -y

# Install dependencies
apt-get install -y \
  curl \
  wget \
  git \
  nodejs \
  npm \
  nginx \
  mongodb-org \
  certbot \
  python3-certbot-nginx \
  docker.io \
  docker-compose \
  ufw \
  fail2ban \
  htop

# Create deploy user
useradd -m -s /bin/bash deploy || true

# Create app directories
mkdir -p /app

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# Start MongoDB
systemctl enable mongodb
systemctl start mongodb

# Start Nginx
systemctl enable nginx
systemctl start nginx

# Install Node.js global packages
npm install -g pm2
pm2 startup
pm2 save

# Create log directory
mkdir -p /var/log/apps
chown -R deploy:deploy /var/log/apps

# Enable fail2ban
systemctl enable fail2ban
systemctl start fail2ban

echo "✅ VPS setup complete!"
echo "📝 Next steps:"
echo "  1. Add your apps to /app/"
echo "  2. Configure SSL certificates"
echo "  3. Deploy apps using docker-compose or PM2"
