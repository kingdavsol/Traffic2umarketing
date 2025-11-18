# Docker Deployment Option (Alternative to PM2)

Docker provides isolation and easier management. Create one Dockerfile for all apps.

## Dockerfile (use for all apps)

Create `Dockerfile` in the root of each app:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
```

## Docker Compose (run all 10 apps)

Create `docker-compose.yml` in `~/apps/`:

```yaml
version: '3.8'

services:
  medisave:
    build:
      context: ./medisave
    ports:
      - "3001:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    restart: always
    volumes:
      - medisave-data:/app/data

  skilltrade:
    build:
      context: ./skilltrade
    ports:
      - "3002:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    restart: always
    volumes:
      - skilltrade-data:/app/data

  neighborcash:
    build:
      context: ./neighborcash
    ports:
      - "3003:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    restart: always
    volumes:
      - neighborcash-data:/app/data

  # ... repeat for other 7 apps on ports 3004-3010

volumes:
  medisave-data:
  skilltrade-data:
  neighborcash-data:
  # ... other volumes
```

## Install Docker on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

## Deploy with Docker

```bash
cd ~/apps

# Build all containers
docker compose build

# Start all apps
docker compose up -d

# View logs
docker compose logs medisave -f

# Stop all apps
docker compose down

# Restart specific app
docker compose restart medisave

# Rebuild and restart after code changes
docker compose up -d --build medisave
```

## Benefits of Docker

✅ Isolation between apps
✅ Easy scaling
✅ No PM2 needed
✅ Consistent dev/prod environments
✅ Easy backups and migrations
✅ Resource limits per app

## GitHub Actions with Docker

```yaml
name: Deploy to VPS with Docker

on:
  push:
    branches:
      - claude/*

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Deploy with Docker
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}

          script: |
            cd ~/apps
            git pull origin main  # Pull docker-compose.yml
            docker compose up -d --build ${{ github.ref_name }}
```

This is often the preferred method for production deployments!
