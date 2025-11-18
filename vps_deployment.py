#!/usr/bin/env python3
"""
Phase 3: VPS Infrastructure Setup
Creates Docker, Nginx, deployment scripts for production
"""

from pathlib import Path
import json

def create_dockerfile(app_path, app_name):
    """Create Dockerfile for app backend"""
    dockerfile = f'''FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app code
COPY backend/ ./

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:5001/health', (r) => {{if (r.statusCode !== 200) throw new Error(r.statusCode)}}))"

# Start app
CMD ["node", "server.js"]
'''

    with open(app_path / "backend" / "Dockerfile", "w") as f:
        f.write(dockerfile)

def create_docker_compose(app_path, app_name, port):
    """Create docker-compose.yml for local development"""
    compose = f'''version: '3.8'

services:
  {app_name.lower()}-backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "{port}:5001"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongodb:27017/{app_name.lower()}
      - JWT_SECRET=${{JWT_SECRET:-your-secret-key}}
      - EMAIL_USER=${{EMAIL_USER}}
      - EMAIL_PASS=${{EMAIL_PASS}}
    depends_on:
      - mongodb
    restart: unless-stopped
    networks:
      - {app_name.lower()}-network

  mongodb:
    image: mongo:6.0-alpine
    ports:
      - "{port + 1000}:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=${{MONGO_PASSWORD:-admin}}
    restart: unless-stopped
    networks:
      - {app_name.lower()}-network

volumes:
  mongodb_data:

networks:
  {app_name.lower()}-network:
    driver: bridge
'''

    with open(app_path / "docker-compose.yml", "w") as f:
        f.write(compose)

def create_nginx_config(app_name, port, domain="example.com"):
    """Create Nginx configuration"""
    config = f'''upstream {app_name.lower()}_backend {{
  server localhost:{port};
  keepalive 64;
}}

server {{
  listen 80;
  listen [::]:80;
  server_name {domain};

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}}

server {{
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name {domain};

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/{domain}/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/{domain}/privkey.pem;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;

  # Gzip Compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1000;
  gzip_types text/plain text/css text/javascript application/json application/javascript;

  # Rate Limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
  limit_req_status 429;

  # Backend proxy
  location /api/ {{
    limit_req zone=api_limit burst=20 nodelay;

    proxy_pass http://{app_name.lower()}_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }}

  # Health check
  location /health {{
    proxy_pass http://{app_name.lower()}_backend;
    access_log off;
  }}
}}
'''

    return config

def create_systemd_service(app_name, port):
    """Create systemd service file"""
    service = f'''[Unit]
Description={app_name} Backend Service
After=network.target mongodb.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/app/{app_name.lower()}
EnvironmentFile=/app/{app_name.lower()}/.env.production
ExecStart=/usr/bin/node /app/{app_name.lower()}/backend/server.js
Restart=on-failure
RestartSec=10s

[Install]
WantedBy=multi-user.target
'''

    return service

def create_deployment_script(app_name):
    """Create deployment script"""
    script = f'''#!/bin/bash

set -e

APP_NAME="{app_name}"
DEPLOY_DIR="/app/$APP_NAME"
REPO_URL="${{GIT_REPO_URL}}"
BRANCH="${{GIT_BRANCH:-main}}"

echo "🚀 Deploying $APP_NAME..."

# Pull latest code
cd $DEPLOY_DIR
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
cd backend
npm ci --only=production

# Run migrations (if needed)
# npm run migrate

# Reload service
systemctl restart $APP_NAME

echo "✅ $APP_NAME deployed successfully"
'''

    return script

def create_monitoring_script():
    """Create monitoring and logging setup"""
    script = '''#!/bin/bash

# Install monitoring tools
apt-get update
apt-get install -y curl wget

# Install node_exporter for Prometheus
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/
useradd --no-create-home --shell /bin/false node_exporter || true

# Create systemd service for node_exporter
cat > /etc/systemd/system/node_exporter.service << EOF
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
User=node_exporter
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

systemctl enable node_exporter
systemctl start node_exporter

echo "✅ Monitoring tools installed"
'''

    return script

def create_vps_setup_script():
    """Create main VPS setup script"""
    script = '''#!/bin/bash

set -e

echo "🚀 Setting up VPS for 30 apps..."

# Update system
apt-get update
apt-get upgrade -y

# Install dependencies
apt-get install -y \\
  curl \\
  wget \\
  git \\
  nodejs \\
  npm \\
  nginx \\
  mongodb-org \\
  certbot \\
  python3-certbot-nginx \\
  docker.io \\
  docker-compose \\
  ufw \\
  fail2ban \\
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
'''

    return script

def create_backup_script():
    """Create backup script for databases"""
    script = '''#!/bin/bash

BACKUP_DIR="/backups/mongodb"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup all MongoDB databases
mongodump --uri="mongodb://admin:${MONGO_PASSWORD}@localhost:27017" \\
  --out=$BACKUP_DIR/$TIMESTAMP

# Compress backup
tar -czf $BACKUP_DIR/$TIMESTAMP.tar.gz $BACKUP_DIR/$TIMESTAMP
rm -rf $BACKUP_DIR/$TIMESTAMP

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/$TIMESTAMP.tar.gz s3://my-backup-bucket/

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup completed: $BACKUP_DIR/$TIMESTAMP.tar.gz"
'''

    return script

def create_all_infrastructure():
    """Create infrastructure files for all apps"""
    base_path = Path("/home/user/Traffic2umarketing/apps")

    # Create infrastructure directory
    infra_path = Path("/home/user/Traffic2umarketing/infrastructure")
    infra_path.mkdir(exist_ok=True)

    # Create VPS setup script
    with open(infra_path / "vps-setup.sh", "w") as f:
        f.write(create_vps_setup_script())

    # Create monitoring script
    with open(infra_path / "setup-monitoring.sh", "w") as f:
        f.write(create_monitoring_script())

    # Create backup script
    with open(infra_path / "backup.sh", "w") as f:
        f.write(create_backup_script())

    # Create Nginx configs
    nginx_path = infra_path / "nginx"
    nginx_path.mkdir(exist_ok=True)

    # Create docker-compose for all apps
    docker_compose_all = '''version: '3.8'

services:
'''

    for i, app_dir in enumerate(sorted(base_path.iterdir()), 1):
        if not app_dir.is_dir():
            continue

        app_name = app_dir.name
        port = 5001 + i

        print(f"⚙️  Creating infrastructure for {app_name}...")

        # Create Dockerfile
        create_dockerfile(app_dir, app_name)

        # Create docker-compose
        create_docker_compose(app_dir, app_name, port)

        # Create Nginx config
        nginx_config = create_nginx_config(
            app_name,
            port,
            f"{app_name.lower()}.yourdomain.com"
        )
        with open(nginx_path / f"{app_name.lower()}.conf", "w") as f:
            f.write(nginx_config)

        # Add to global docker-compose
        docker_compose_all += f'''
  {app_name.lower()}-backend:
    build:
      context: ./apps/{app_name}
      dockerfile: backend/Dockerfile
    ports:
      - "{port}:5001"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/{app_name.lower()}
    depends_on:
      - mongodb
    restart: unless-stopped

'''

        print(f"✅ {app_name} infrastructure created")

    # Add MongoDB to global docker-compose
    docker_compose_all += '''
  mongodb:
    image: mongo:6.0-alpine
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
'''

    with open(infra_path / "docker-compose.yml", "w") as f:
        f.write(docker_compose_all)

    # Make scripts executable
    import os
    import stat

    for script in [infra_path / "vps-setup.sh", infra_path / "setup-monitoring.sh", infra_path / "backup.sh"]:
        st = os.stat(script)
        os.chmod(script, st.st_mode | stat.S_IEXEC)

    print(f"\n📁 Infrastructure created in: {infra_path}")

if __name__ == "__main__":
    print("⚙️  Setting up VPS infrastructure...\n")
    create_all_infrastructure()
    print("\n✅ VPS infrastructure ready!")
