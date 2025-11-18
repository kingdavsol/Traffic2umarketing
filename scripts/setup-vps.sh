#!/bin/bash

# Traffic2u VPS Setup Script
# This script sets up a fresh VPS for deployment

set -e

echo "============================================"
echo "Traffic2u Insurance - VPS Setup"
echo "============================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo "Please run as root (use sudo)"
   exit 1
fi

# Update system
echo "[1/8] Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Docker
echo "[2/8] Installing Docker..."
apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Install Docker Compose (standalone)
echo "[3/8] Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js and npm
echo "[4/8] Installing Node.js and npm..."
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2 globally (for non-Docker deployment option)
echo "[5/8] Installing PM2..."
npm install -g pm2
pm2 startup
pm2 save

# Install Certbot for SSL certificates
echo "[6/8] Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Create necessary directories
echo "[7/8] Creating directories..."
mkdir -p /home/traffic2u/ssl
mkdir -p /home/traffic2u/logs
mkdir -p /home/traffic2u/data

# Create non-root user for traffic2u
echo "[8/8] Creating traffic2u user..."
if id "traffic2u" &>/dev/null; then
    echo "User traffic2u already exists"
else
    useradd -m -s /bin/bash traffic2u
    usermod -aG docker traffic2u
fi

# Set permissions
chown -R traffic2u:traffic2u /home/traffic2u
chmod 755 /home/traffic2u

echo ""
echo "============================================"
echo "✅ VPS Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. SSH as traffic2u user: ssh traffic2u@your-vps-ip"
echo "2. Clone the repository"
echo "3. Create .env file from .env.example"
echo "4. Generate SSL certificates: ./scripts/generate-ssl.sh"
echo "5. Deploy: docker-compose up -d"
echo ""
