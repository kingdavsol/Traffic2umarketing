# Traffic2u Monitoring Dashboard

A lightweight, functional admin monitoring dashboard for tracking performance metrics across your app portfolio (50-70+ apps). Monitor users, downloads, revenue, ad performance, and custom metrics for all your applications from a single interface.

## Features

- **Real-time Metrics Collection** - Apps POST metrics to the dashboard
- **Admin Dashboard** - Clean web interface for viewing all app statistics
- **Flexible Metrics** - Support for standard metrics (users, downloads, revenue, ads) + custom metrics
- **Timeline Analytics** - View aggregated trends across all apps
- **Per-App Analytics** - Detailed statistics for individual apps
- **Search & Filter** - Find apps and filter by performance metrics
- **VPS Deployment Ready** - Lightweight, self-contained, minimal dependencies

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (file-based, no separate DB server needed)
- **Frontend**: Vanilla JavaScript + CSS (no build step required)
- **Security**: Basic authentication for admin dashboard

## Installation

### Prerequisites

- Node.js 14+ installed
- npm

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` with your settings**:
   ```env
   PORT=3000
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your_secure_password
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Access the dashboard**:
   - Open `http://localhost:3000/dashboard`
   - Username: `admin`
   - Password: `your_secure_password`

## API Endpoints

### Metrics Collection (No Authentication)

#### POST `/api/metrics` - Submit App Metrics

Submit daily metrics for your app. The app will be auto-registered if it doesn't exist.

**Request Body**:
```json
{
  "appName": "bizbuys",
  "displayName": "BizBuys Procurement",
  "date": "2024-01-15",
  "metrics": {
    "users": 1500,
    "activeUsers": 1200,
    "downloads": 75,
    "revenue": 250.50,
    "adImpressions": 5000,
    "adClicks": 250,
    "sessions": 3000,
    "custom": {
      "retention_rate": "78%",
      "avg_session_time": "4.5m"
    }
  }
}
```

**Fields**:
- `appName` (required): Unique identifier for your app
- `displayName`: Human-readable app name
- `date` (optional): YYYY-MM-DD format (defaults to today)
- `metrics` (required): Object with metric values
  - Standard metrics: `users`, `activeUsers`, `downloads`, `revenue`, `adImpressions`, `adClicks`, `sessions`
  - All are optional - send only the metrics you have
  - `custom`: Object for any custom metrics

**Example cURL**:
```bash
curl -X POST http://your-domain.com/api/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "appName": "bizbuys",
    "displayName": "BizBuys",
    "metrics": {
      "users": 1500,
      "downloads": 75,
      "revenue": 250.00
    }
  }'
```

#### POST `/api/apps` - Register App

Manually register an app.

**Request Body**:
```json
{
  "appName": "bizbuys",
  "displayName": "BizBuys Procurement"
}
```

#### GET `/api/apps` - List All Registered Apps

Returns all registered apps.

#### GET `/api/apps/:appId/summary` - Get App Summary

Get summary statistics for a specific app including today's stats and last 30 days.

### Dashboard API (Authentication Required)

#### GET `/dashboard/api/overview`

Get platform-wide overview statistics.

**Response**:
```json
{
  "totalApps": 15,
  "today": {
    "active_apps": 12,
    "total_users": 25000,
    "total_downloads": 500,
    "total_revenue": 5000.00,
    "total_sessions": 50000
  },
  "sevenDayAvg": {
    "avg_users": 22000,
    "avg_downloads": 450,
    "avg_revenue": 4500.00
  }
}
```

#### GET `/dashboard/api/apps`

Get all apps with their latest statistics.

#### GET `/dashboard/api/apps/:appId`

Get detailed statistics for a specific app.

**Query Parameters**:
- `days` (optional): Number of days of historical data (default: 30)

#### GET `/dashboard/api/stats/timeline`

Get platform-wide timeline data.

**Query Parameters**:
- `days` (optional): Number of days (default: 30)

## Integration Guide

### For Node.js/Next.js Apps

```javascript
// Send metrics daily
async function reportMetrics() {
  const metrics = {
    appName: 'bizbuys',
    displayName: 'BizBuys',
    metrics: {
      users: getUserCount(),
      activeUsers: getActiveUserCount(),
      downloads: getTodayDownloads(),
      revenue: getTodayRevenue(),
      adImpressions: getTodayAdImpressions(),
      adClicks: getTodayAdClicks(),
      sessions: getTodaySessionCount()
    }
  };

  await fetch('http://monitoring-dashboard.com/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  });
}

// Call once daily via cron job or scheduled task
setInterval(reportMetrics, 24 * 60 * 60 * 1000);
```

### For Python Apps

```python
import requests
import json
from datetime import datetime

def report_metrics(app_name, display_name, metrics):
    url = "http://monitoring-dashboard.com/api/metrics"

    payload = {
        "appName": app_name,
        "displayName": display_name,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "metrics": metrics
    }

    response = requests.post(url, json=payload)
    return response.json()

# Usage
report_metrics(
    "bizbuys",
    "BizBuys",
    {
        "users": 1500,
        "downloads": 75,
        "revenue": 250.00
    }
)
```

### For Any Platform (cURL)

Create a daily cron job to submit metrics:

```bash
#!/bin/bash

# daily_metrics.sh
DASHBOARD_URL="http://monitoring-dashboard.com"
APP_NAME="bizbuys"

curl -X POST $DASHBOARD_URL/api/metrics \
  -H "Content-Type: application/json" \
  -d "{
    \"appName\": \"$APP_NAME\",
    \"metrics\": {
      \"users\": 1500,
      \"downloads\": 75,
      \"revenue\": 250.00
    }
  }"
```

Add to crontab (runs daily at 11:59 PM):
```bash
59 23 * * * /path/to/daily_metrics.sh >> /var/log/metrics.log 2>&1
```

## VPS Deployment

### Using systemd (Recommended)

1. **Create systemd service file** at `/etc/systemd/system/monitoring-dashboard.service`:
   ```ini
   [Unit]
   Description=Traffic2u Monitoring Dashboard
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/opt/traffic2u-monitoring
   ExecStart=/usr/bin/node server.js
   Restart=always
   RestartSec=10
   Environment="NODE_ENV=production"
   EnvironmentFile=/opt/traffic2u-monitoring/.env

   [Install]
   WantedBy=multi-user.target
   ```

2. **Enable and start**:
   ```bash
   sudo systemctl enable monitoring-dashboard
   sudo systemctl start monitoring-dashboard
   sudo systemctl status monitoring-dashboard
   ```

3. **View logs**:
   ```bash
   sudo journalctl -u monitoring-dashboard -f
   ```

### Using PM2 (Alternative)

```bash
npm install -g pm2

# Start the app
pm2 start server.js --name "monitoring-dashboard"

# Set to restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs monitoring-dashboard
```

### Using Nginx as Reverse Proxy

```nginx
server {
    listen 80;
    server_name monitoring.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Using Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t traffic2u-monitoring .
docker run -d -p 3000:3000 \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your_password \
  -v monitoring-data:/app/data \
  traffic2u-monitoring
```

## Database

The dashboard uses SQLite, stored in `data/monitoring.db`.

### Database Structure

- **apps**: Registered applications
- **daily_stats**: Daily metrics for each app (users, downloads, revenue, etc.)
- **custom_metrics**: Flexible storage for custom metrics
- **metrics**: Metric history (for future use)

### Backup

```bash
# Simple file backup
cp data/monitoring.db data/monitoring.db.backup

# Scheduled backup (add to crontab)
0 2 * * * cp /opt/traffic2u-monitoring/data/monitoring.db /opt/traffic2u-monitoring/backups/monitoring-$(date +\%Y\%m\%d).db.backup
```

### Reset Database

```bash
rm data/monitoring.db
npm start  # Will recreate empty schema
```

## Security Considerations

1. **Change default credentials** in `.env`
2. **Use HTTPS** - Deploy with SSL/TLS certificate
3. **Firewall** - Restrict dashboard access to your IP
4. **Environment variables** - Never commit `.env` to git
5. **API rate limiting** - Consider adding rate limits for metrics endpoints
6. **Database encryption** - For sensitive data, encrypt SQLite database

## Monitoring the Monitor

Check if the dashboard is running:

```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

## Performance Metrics

- **Database**: SQLite supports ~100,000+ daily records
- **Memory**: ~50MB with 50+ apps
- **CPU**: Minimal overhead
- **Scalability**: For higher volumes, consider PostgreSQL

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Database Lock Error
```bash
# Remove lock file if database is corrupted
rm data/monitoring.db-wal
rm data/monitoring.db-shm
npm start
```

### Metrics Not Appearing

1. Check app name matches exactly (case-sensitive)
2. Verify POST request uses correct URL
3. Check application logs: `npm run dev`
4. Test with cURL command above

## File Structure

```
.
├── server.js                 # Main server file
├── package.json              # Dependencies
├── .env.example              # Environment template
├── lib/
│   └── db.js                # Database layer
├── routes/
│   ├── api.js               # Metrics API endpoints
│   └── dashboard.js         # Dashboard API endpoints
├── public/
│   └── dashboard.html       # Admin dashboard UI
└── data/
    └── monitoring.db        # SQLite database (auto-created)
```

## Future Enhancements

- Email/Slack alerts for metric thresholds
- Data export (CSV, JSON)
- Advanced charting with Chart.js
- User authentication (instead of basic auth)
- Multi-tenant support
- Webhook notifications
- API key authentication

## Support & Issues

For issues or questions:
1. Check logs: `npm run dev`
2. Verify `.env` configuration
3. Test API endpoints with cURL
4. Check database: `sqlite3 data/monitoring.db`

## License

MIT

---

**Getting Started**: Deploy to VPS → Update `.env` → Share metrics endpoint with your apps → Start monitoring!
